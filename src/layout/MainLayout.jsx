import React, { useState } from "react";
import ContactsSidebar from "../components/ContactsSidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import TopNav from "../components/TopNav.jsx"; // ✅ new import

export default function MainLayout({ contacts = [] }) {
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* ✅ Top Navigation */}
      <TopNav />

      {/* ✅ Main Content Below Nav */}
      <div className="flex flex-col sm:flex-row flex-1 pt-[64px] sm:pt-[72px]">
        {/* Sidebar */}
        <div
          className={`flex-shrink-0 w-full sm:w-1/4 bg-white border-r border-gray-200 transition-transform duration-300 ${
            selectedContact ? "translate-x-[-100%] sm:translate-x-0" : "translate-x-0"
          }`}
        >
          <ContactsSidebar
            contacts={contacts}
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
          />
        </div>

        {/* Chat window */}
        <div
          className={`flex-1 bg-gray-50 transition-transform duration-300 ${
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
    </div>
  );
}
