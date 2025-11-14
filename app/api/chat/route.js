import { ChatGroq } from "@langchain/groq";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import fs from "fs";
import path from "path";
import { pipeline } from "@xenova/transformers";

// ---------- GLOBAL STORAGE ----------
const chatHistories = new Map();
let embedder = null;
let knowledgeTexts = [];
let knowledgeEmbeddings = [];
const RELEVANCE_THRESHOLD = 0.35; // Lowered for short queries

// ---------- LOAD ALL KNOWLEDGE FILES ----------
async function loadKnowledgeBase() {
  if (knowledgeTexts.length > 0) return knowledgeTexts;

  const knowledgeDir = path.join(process.cwd(), "data", "knowledge");

  if (!fs.existsSync(knowledgeDir)) {
    throw new Error("Knowledge folder does not exist: " + knowledgeDir);
  }

  const files = fs.readdirSync(knowledgeDir);

  files.forEach((file) => {
    const filePath = path.join(knowledgeDir, file);
    if (fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath, "utf-8").trim();
      if (content) knowledgeTexts.push(content);
    }
  });

  return knowledgeTexts;
}

// ---------- INITIALIZE EMBEDDING MODEL ----------
async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
}

// ---------- GET EMBEDDING VECTOR ----------
async function getEmbedding(text) {
  const model = await getEmbedder();
  const output = await model(text, { pooling: "mean", normalize: true });

  // Normalize to plain array (important!)
  let embedding;
  if (Array.isArray(output.data)) {
    if (Array.isArray(output.data[0])) {
      embedding = output.data[0];
    } else {
      embedding = output.data;
    }
  } else if (output.tensor) {
    embedding = Array.from(output.tensor.data);
  } else {
    embedding = Array.from(output);
  }

  return embedding.map((v) => parseFloat(v)); // ensure numeric
}

// ---------- COSINE SIMILARITY ----------
function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;

  let dot = 0,
    normA = 0,
    normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

// ---------- POST: Chat Endpoint ----------
export async function POST(req) {
  try {
    const { messages, sessionId = "default" } = await req.json();
    const latestMessage = messages[messages.length - 1];
    const userInput = latestMessage.content;

    if (!userInput.trim()) {
      return new Response(
        JSON.stringify({ message: "Please enter a valid question." }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Load knowledge & embeddings
    const kb = await loadKnowledgeBase();
    if (knowledgeEmbeddings.length === 0) {
      knowledgeEmbeddings = [];
      for (const text of kb) {
        const emb = await getEmbedding(text);
        knowledgeEmbeddings.push(emb);
      }
    }

    const userEmbed = await getEmbedding(userInput);

    // Compute similarity for each knowledge text
    const sims = kb.map((text, i) => ({
      text,
      score: cosineSimilarity(userEmbed, knowledgeEmbeddings[i]),
    }));

    sims.sort((a, b) => b.score - a.score);
    const top = sims[0];

    // Check relevance
    if (top.score < RELEVANCE_THRESHOLD) {
      return new Response(
        JSON.stringify({
          message:
            "I’m sorry, but your question seems unrelated to our company or its services. Could you please ask something about Infotech or what we offer?",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize Groq model
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    // Maintain chat history
    if (!chatHistories.has(sessionId)) chatHistories.set(sessionId, []);
    const history = chatHistories.get(sessionId);
    history.push(new HumanMessage(userInput));

    // System prompt with top knowledge
    const systemPrompt = `
You are Sales Manager representing Infotech Solutions.
Use ONLY the following context to answer the user:
${top.text}
If the question is unclear or unrelated, politely say that you don't have that information in a short.
highlist output text using bold where it is needed.
`;

    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      ...history,
    ]);

    history.push(new AIMessage(response.content));
    chatHistories.set(sessionId, history);

    return new Response(JSON.stringify({ message: response.content }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in POST:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ---------- DELETE: Clear History ----------
export async function DELETE(req) {
  try {
    const { sessionId = "default" } = await req.json();
    chatHistories.delete(sessionId);

    return new Response(JSON.stringify({ message: "History cleared" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to clear history" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
