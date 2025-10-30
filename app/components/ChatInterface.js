"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(`session-${Date.now()}`); // Unique session ID

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Send with session ID for memory management
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: updatedMessages,
          sessionId: sessionId.current 
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant's response to conversation
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.message }
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      // Clear server-side history
      await fetch("/api/chat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: sessionId.current }),
      });

      // Reset local messages
      setMessages([
        { role: "assistant", content: "Hello! How can I help you today?" }
      ]);

      // Generate new session ID
      sessionId.current = `session-${Date.now()}`;
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      {/* Header with Clear Button */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b">
        <h2 className="text-lg font-semibold text-gray-700">Chat with AI</h2>
        <button
          onClick={clearHistory}
          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
        >
          Clear History
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-gray-50 rounded-lg p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2">
              <p>Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}