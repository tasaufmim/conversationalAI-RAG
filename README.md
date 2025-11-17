# Conversational AI Chatbot  
A company-specific AI assistant powered by **Groq LLMs**, **LangChain**, and **Next.js**.  
The chatbot intelligently checks whether a user's question is relevant to the company, and:

✔ Responds using the company's **knowledge base** (text/JSON files)  
✔ Rejects irrelevant queries politely  
✔ Provides fast responses using **Groq Llama 3.3 70B**  
✔ Supports **Markdown rendering** (bold text, bullet points, lists, etc.)  
✔ Maintains session-based conversation history

---

## Features

### 1. Company-Aware Chatbot  
Only answers queries related to the company’s services.  
If irrelevant → returns:

> “I’m sorry, but your question seems unrelated to our company or its services.”

### 2. Knowledge Base Search  
All company info lives inside:
```bash
knowledge/
  about.txt
  services.txt
  company.json
```


The chatbot automatically loads *all* files inside this folder.

### 3. Embedding-Based Relevance Filtering  
Uses **MiniLM embeddings** to check if the user’s question truly matches the company domain.

### 4. Ultra-Fast AI Responses  
Powered by **Groq API** + **LangChain** → extremely low latency.

### 5. Frontend with Markdown Rendering  
User messages and responses support:

- **Bold text**
- Bullet points
- Numbered lists
- Code formatting
- Line breaks

### 6. Conversation Memory  
Every user session has its own in-memory message history.

---

## Project Structure
```bash
conversationalAI-RAG
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
```


---

## ⚙️ Installation & Setup

### **1️⃣ Clone the repository**

```bash
git clone https://github.com/your-username/conversationalAI-RAG.git
cd conversationalAI-RAG
```

### **2️⃣ Create & Activate Python Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows
```

### **3️⃣ Install dependencies**

```bash
npm install
```
Includes: next.js react @langchain/groq @xenova/transformers react-markdown

### **4️⃣ Add your Groq API key**

```bash
GROQ_API_KEY=your_groq_api_key_here
```

### **5️⃣ Start the development server**
```bash
npm run dev
```

Then visit
```bash
http://localhost:3000
```
