import React, { useState } from "react";
import ContactsSidebar from "../components/ContactsSidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";

export default function MainLayout({ contacts = [] }) {
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <div className="h-screen flex flex-col sm:flex-row bg-[#ECE5DD] overflow-hidden">
      {/* Sidebar */}
      <div
        className={`flex-shrink-0 w-full sm:w-1/4 bg-white border-r border-gray-300 transition-transform duration-300 sm:transform-none ${
          selectedContact ? "-translate-x-full sm:translate-x-0" : "translate-x-0"
        }`}
      >
        <ContactsSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
        />
      </div>

      {/* Chat Window */}
      <div
        className={`flex-1 flex flex-col transition-transform duration-300 sm:transform-none ${
          selectedContact ? "translate-x-0" : "translate-x-full sm:translate-x-0"
        }`}
      >
        {selectedContact ? (
          <ChatWindow
            contact={selectedContact}
            onBack={() => setSelectedContact(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to view conversation
          </div>
        )}
      </div>
    </div>
  );
}
