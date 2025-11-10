import React, { useState } from "react";
import ContactsSidebar from "../components/ContactsSidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";

export default function MainLayout({ contacts }) {
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar - hidden when chat is open on mobile */}
      <div
        className={`flex-shrink-0 w-full sm:w-1/4 bg-white border-r border-gray-200 ${
          selectedContact ? "hidden sm:flex" : "flex"
        } flex-col`}
      >
        <ContactsSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
        />
      </div>

      {/* Chat window - hidden on mobile until contact selected */}
      <div
        className={`flex-1 flex-col ${
          selectedContact ? "flex" : "hidden sm:flex"
        }`}
      >
        {selectedContact ? (
          <ChatWindow
            contact={selectedContact}
            onBack={() => setSelectedContact(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
