<<<<<<< HEAD
import MainLayout from "./layout/MainLayout";
import ContactsSidebar from "./components/ContactsSidebar";
import ChatWindow from "./components/ChatWindow";

function App() {
  return (
    <MainLayout>
      <h1 className="text-red-500 text-5xl">TAILWIND IS WORKING</h1>

      <ContactsSidebar />
      <ChatWindow />
    </MainLayout>
  );
}

export default App;
=======
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import InvoicesPage from "./pages/InvoicesPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

export default function App() {
  const [selectedContact, setSelectedContact] = useState(null);

  const contacts = [
    { id: 1, name: "Jane’s Fashion Store", lastMessage: "New order today?" },
    { id: 2, name: "Divine Bakery", lastMessage: "Cake order confirmed 🍰" },
    { id: 3, name: "Lagos Tech Gadgets", lastMessage: "Payment received 💳" },
  ];

  return (
    <Router>
      <div className="h-screen bg-gray-100 overflow-hidden">
        <Routes>
          {/* 💬 Default chat layout */}
          <Route
            path="/"
            element={
              <MainLayout
                contacts={contacts}
                selectedContact={selectedContact}
                onSelectContact={setSelectedContact}
              />
            }
          />
          {/* 📦 Other pages */}
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* 🚫 Redirect unknown */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
>>>>>>> restore-ui-fix
