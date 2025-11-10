import React, { useState } from "react";
import MainLayout from "./layout/MainLayout.jsx";
import ContactsSidebar from "./components/ContactsSidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";

export default function App() {
  const [selectedContact, setSelectedContact] = useState(null);

  // simple mock contacts
  const contacts = [
    { id: 1, name: "Jane’s Fashion Store", lastMessage: "New order today?" },
    { id: 2, name: "Divine Bakery", lastMessage: "Cake order confirmed." },
    { id: 3, name: "Lagos Tech Gadgets", lastMessage: "Payment received!" },
  ];

  return (
    <MainLayout>
      <ContactsSidebar
        contacts={contacts}
        selectedContact={selectedContact}
        onSelectContact={setSelectedContact}
      />
      <ChatWindow contact={selectedContact} />
    </MainLayout>
  );
}
