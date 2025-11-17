🧠 Infotech AI Chatbot
A company-specific AI assistant powered by Groq LLMs, LangChain, and Next.js.
The chatbot intelligently checks whether a user's question is relevant to the company, and:
✔ Responds using the company's knowledge base (text/JSON files)
✔ Rejects irrelevant queries politely
✔ Provides fast responses using Groq Llama 3.3 70B
✔ Supports Markdown rendering (bold text, bullet points, lists, etc.)
✔ Maintains session-based conversation history
🚀 Features
✅ 1. Company-Aware Chatbot
Only answers queries related to the company’s services.
If irrelevant → returns:
“I’m sorry, but your question seems unrelated to our company…”
✅ 2. Knowledge Base Search
You can store company info in:
knowledge/
  about.txt
  services.txt
  company.json
All files are loaded into memory automatically.
✅ 3. Semantic Relevance Filtering
User input is encoded using MiniLM embeddings, and similarity is checked against the knowledge base.
✅ 4. Ultra-Fast AI Responses
Powered by Groq API + LangChain for superior speed.
✅ 5. Frontend with Markdown Rendering
The chat UI supports:
Bold text
Lists
Numbered points
Clickable links
Clean formatting
✅ 6. Conversation Memory
Each client gets its own session ID, stored in-memory.
📁 Project Structure
infotech_chatbot-appV2
│
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.js   → Chat backend with relevance filtering
│   ├── components/
│   │   └── ChatInterface.js   → Frontend UI with Markdown
│   └── layout.js
│
├── knowledge/
│   ├── about.txt
│   ├── services.txt
│   └── any-file-here.txt
│
├── .env.local
├── package.json
├── README.md
└── next.config.js
⚙️ Setup Instructions
1️⃣ Clone the repository
git clone https://github.com/your-username/infotech-chatbot.git
cd infotech-chatbot
2️⃣ Install dependencies
npm install
Required libraries include:
next.js
react
@langchain/groq
@xenova/transformers
react-markdown
3️⃣ Setup environment variables
Create .env.local:
GROQ_API_KEY=your_groq_api_key_here
4️⃣ Add your knowledge base
Place all .txt or .json inside:
/knowledge
The system automatically loads them on startup.
5️⃣ Run the development server
npm run dev
Server runs at:
http://localhost:3000
🧠 How It Works (Architecture Overview)
1. Load Knowledge Base
route.js reads all files in /knowledge and merges them.
2. Convert Knowledge to Embeddings
Using:
@xenova/transformers → all-MiniLM-L6-v2
3. Check Query Relevance
Uses cosine similarity:
if similarity < 0.35 → reject as irrelevant
4. Provide Company-Specific Answer
If relevant, chatbot responds using:
Groq LLM
Injected system prompt + knowledge context
5. Frontend Markdown Rendering
react-markdown displays:
Bold (**text**)
Lists (- item)
Links ([link](url))
🖥️ UI Preview
You can include images (optional):
/public/screenshot.png
🧪 Example Queries
Relevant ❇️
“What services does Infotech offer?”
→ returns formatted Markdown list.
Not Relevant ⛔
“Who is the president of the USA?”
→ returns polite refusal.
🛠️ Future Improvements
Add vector database (Pinecone, Chroma, Weaviate)
Add streaming responses
Add typing animation
Add admin dashboard to update company text files
Add user authentication
🤝 Contributing
Pull requests are welcome!
If you're adding a new feature, please discuss it in an issue first.
📜 License
MIT License.
