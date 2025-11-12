import React, { useState } from "react";
import ContactsSidebar from "../components/ContactsSidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import TopNav from "../components/TopNav.jsx";

export default function MainLayout({ contacts = [] }) {
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <>
      {/* ✅ TopNav lives completely outside transforms — always visible */}
      <TopNav
        showBack={!!selectedContact}
        onBack={() => setSelectedContact(null)}
        title={selectedContact ? selectedContact.name : "Vendor Dashboard"}
      />

      {/* ✅ Main app body sits below the fixed nav */}
      <div className="relative h-screen flex flex-col bg-gray-100 overflow-hidden pt-[56px] sm:pt-[64px]">
        <div className="flex flex-col sm:flex-row flex-1 z-0">
          {/* Sidebar (no longer affects z-index) */}
          <div
            className={`flex-shrink-0 w-full sm:w-1/4 bg-white border-r border-gray-200 
              transform-gpu transition-transform duration-300 ${
                selectedContact
                  ? "translate-x-[-100%] sm:translate-x-0"
                  : "translate-x-0"
              }`}
            style={{ zIndex: 0 }}
          >
            <ContactsSidebar
              contacts={contacts}
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
            />
          </div>

          {/* Chat Window */}
          <div
            className={`flex-1 bg-gray-50 transform-gpu transition-transform duration-300 ${
              selectedContact
                ? "translate-x-0"
                : "translate-x-full sm:translate-x-0"
            }`}
            style={{ zIndex: 0 }}
          >
            {selectedContact ? (
              <ChatWindow
                contact={selectedContact}
                onBack={() => setSelectedContact(null)}
              />
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a chat to view conversation
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
