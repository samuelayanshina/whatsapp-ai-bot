import React from "react";
import { X, FileText, BarChart3, Settings, LogOut, ShoppingBag, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function SideDrawer({ isOpen, onClose }) {
  const navItems = [
    { to: "/", icon: MessageSquare, label: "Chats" },
    { to: "/orders", icon: ShoppingBag, label: "Orders" },
    { to: "/invoices", icon: FileText, label: "Invoices" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className={`fixed inset-0 z-40 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button className="w-full flex items-center gap-3 p-2 rounded-lg text-red-600 hover:bg-red-50">
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
