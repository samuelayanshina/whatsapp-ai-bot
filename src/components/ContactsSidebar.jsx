import React from "react";

export default function ContactsSidebar({ contacts, selectedContact, onSelectContact }) {
  return (
    <div className="w-full sm:w-1/4 border-r border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Contacts</h2>
      </div>

      {/* Contact list */}
      <div className="overflow-y-auto flex-1">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 ${
              selectedContact?.id === contact.id ? "bg-gray-200" : ""
            }`}
          >
            <div className="font-medium text-gray-800">{contact.name}</div>
            <div className="text-sm text-gray-500 truncate">
              {contact.lastMessage}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
