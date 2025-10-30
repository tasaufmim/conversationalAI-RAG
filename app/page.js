import ChatInterface from "./components/ChatInterface";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          Infotech AI Chatbot
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Conversational AI Chatbot
        </p>
        <ChatInterface />
      </div>
    </main>
  );
}