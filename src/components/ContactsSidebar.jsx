import React from "react";
import { Search, MoreVertical, MessageSquare } from "lucide-react";

export default function ContactsSidebar({
  contacts = [],
  selectedContact,
  onSelectContact,
}) {
  const placeholderChats = [
    { id: 1, name: "Jane’s Fashion Store", lastMessage: "New order today?" },
    { id: 2, name: "Divine Bakery", lastMessage: "Cake order confirmed 🍰" },
    { id: 3, name: "Lagos Tech Gadgets", lastMessage: "Payment received 💳" },
    { id: 4, name: "Coach Daniels", lastMessage: "Ready for our 1:1 call?" },
  ];

  const displayContacts = contacts.length > 0 ? contacts : placeholderChats;

  return (
    <div className="w-full sm:w-1/4 border-r border-gray-200 bg-white flex flex-col">
      {/* ✅ Fixed header inside the sidebar */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <MoreVertical size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="flex-1 bg-transparent outline-none text-sm text-gray-700"
          />
        </div>
      </div>

      {/* ✅ Scrollable chat list (header stays put) */}
      <div className="overflow-y-auto flex-1">
        {displayContacts.length > 0 ? (
          displayContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 flex flex-col ${
                selectedContact?.id === contact.id ? "bg-gray-200" : ""
              }`}
            >
              <div className="font-medium text-gray-800">{contact.name}</div>
              <div className="text-sm text-gray-500 truncate">
                {contact.lastMessage}
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
            <MessageSquare size={40} className="mb-3 text-gray-300" />
            <p className="text-sm">No chats yet 👋</p>
          </div>
        )}
      </div>
    </div>
  );
}
