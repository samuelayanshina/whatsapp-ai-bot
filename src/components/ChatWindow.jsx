import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile } from "lucide-react";

export default function ChatWindow({ contact, onBack }) {
  const [messages, setMessages] = useState([
    { from: "user", text: "Hey there! 👋 Do you still have the red sneakers in stock?" },
    { from: "me", text: "Yes, we do! Size 42 is available." },
    { from: "user", text: "Perfect, I’ll take one pair please." },
    { from: "me", text: "Great! I’ll send you the invoice now ✅" },
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
    <div className="flex flex-col h-full bg-[#ECE5DD]">

      {/* ✅ Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.from === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow transition-all ${
                msg.from === "me"
                  ? "bg-[#DCF8C6] text-gray-800 rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ✅ Input bar — perfectly pinned, no jump */}
      <div className="p-3 border-t border-gray-300 bg-white flex items-center gap-3">
        <button className="text-gray-500 hover:text-gray-700">
          <Smile size={22} />
        </button>

        <button className="text-gray-500 hover:text-gray-700">
          <Paperclip size={20} />
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#25D366]"
        />

        <button
          onClick={sendMessage}
          className="p-2 bg-[#25D366] text-white rounded-full hover:bg-[#1DA955] transition"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
