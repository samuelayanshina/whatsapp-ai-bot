import React, { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Auto-close in 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-gray-800";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in`}
      >
        <span>{message}</span>
      </div>
    </div>
  );
}
