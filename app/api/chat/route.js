import { ChatGroq } from "@langchain/groq";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

// Simple in-memory storage for chat histories
const chatHistories = new Map();

export async function POST(req) {
  try {
    const { messages, sessionId = "default" } = await req.json();

    // Initialize LangChain Groq model
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    // Get or create chat history for this session
    if (!chatHistories.has(sessionId)) {
      chatHistories.set(sessionId, []);
    }
    
    const history = chatHistories.get(sessionId);

    // Convert messages to LangChain format and add to history
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role === "user") {
      history.push(new HumanMessage(latestMessage.content));
    }

    // Invoke the model with full history
    const response = await model.invoke(history);

    // Add AI response to history
    history.push(new AIMessage(response.content));

    // Update the history in our Map
    chatHistories.set(sessionId, history);

    return new Response(
      JSON.stringify({ 
        message: response.content 
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to get response" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Clear chat history endpoint
export async function DELETE(req) {
  try {
    const { sessionId = "default" } = await req.json();
    chatHistories.delete(sessionId);
    
    return new Response(
      JSON.stringify({ message: "History cleared" }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to clear history" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}