import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react"; // optional icon lib (install via npm if needed)

export default function ChatWindow({ contact, onBack }) {
  const [messages, setMessages] = useState([
    { from: "user", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { from: "me", text: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white shadow-sm">
        {/* Back button for mobile */}
        <button
          onClick={onBack}
          className="sm:hidden text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="font-semibold text-gray-800 text-lg truncate">
          {contact?.name || "Select a contact"}
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.from === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow-sm ${
                msg.from === "me"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white flex gap-2 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="px-5 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 active:scale-95 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
