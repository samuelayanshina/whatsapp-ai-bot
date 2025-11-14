import React from "react";

export default function OrderCard({ order }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">{order.customer}</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            order.status === "Completed"
              ? "bg-green-100 text-green-800"
              : order.status === "Cancelled"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {order.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 mt-1">
        {order.product} × {order.quantity}
      </p>

      <p className="text-gray-800 font-medium mt-2">
        ₦{order.total.toLocaleString()}
      </p>

      <p className="text-xs text-gray-500 mt-2">{order.date}</p>
    </div>
  );
}
