import React, { useState } from "react";
import { Menu, Bell, User } from "lucide-react";
import SideDrawer from "./SideDrawer.jsx"; // ✅ import drawer

export default function TopNav() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* ✅ Drawer */}
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* ✅ Top Bar */}
      <header className="fixed top-0 left-0 w-full bg-[#075E54] text-white z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="sm:hidden hover:bg-[#064C46] p-2 rounded-lg"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold tracking-wide">
              Vendor Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
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
