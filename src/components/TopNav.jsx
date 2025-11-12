import React, { useState } from "react";
import { Menu, ArrowLeft, Bell, User } from "lucide-react";
import SideDrawer from "./SideDrawer.jsx";

export default function TopNav({ showBack = false, onBack, title = "Vendor Dashboard" }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* ✅ Drawer (under TopNav, but above content) */}
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* ✅ Fixed header — zero space issues */}
      <header className="fixed top-0 left-0 right-0 bg-[#075E54] text-white z-50 shadow-md">
        <div className="flex items-center justify-between w-full px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="sm:hidden hover:bg-[#064C46] p-2 rounded-lg"
              onClick={showBack ? onBack : () => setIsDrawerOpen(true)}
            >
              {showBack ? <ArrowLeft size={22} /> : <Menu size={22} />}
            </button>
            <h1 className="text-lg sm:text-xl font-semibold tracking-wide truncate">
              {title}
            </h1>
          </div>

          {/* Hide right icons when in chat view */}
          <div
            className={`flex items-center gap-4 transition-opacity duration-300 ${
              showBack ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <button className="hover:bg-[#064C46] p-2 rounded-lg">
              <Bell size={20} />
            </button>
            <button className="hover:bg-[#064C46] p-2 rounded-lg">
              <User size={20} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
