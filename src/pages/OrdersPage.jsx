import React, { useState } from "react";
import { Package, CheckCircle, Clock, XCircle } from "lucide-react";

export default function OrdersPage() {
  // 🧩 Fake order data
  const [orders] = useState([
    {
      id: "ORD-1001",
      customer: "Jane’s Fashion Store",
      amount: 12500,
      status: "Completed",
      date: "2025-11-08",
    },
    {
      id: "ORD-1002",
      customer: "Divine Bakery",
      amount: 8500,
      status: "Pending",
      date: "2025-11-09",
    },
    {
      id: "ORD-1003",
      customer: "Tech Universe",
      amount: 19400,
      status: "Cancelled",
      date: "2025-11-07",
    },
    {
      id: "ORD-1004",
      customer: "Lagos Gadgets",
      amount: 25000,
      status: "Completed",
      date: "2025-11-06",
    },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <CheckCircle size={16} /> {status}
          </span>
        );
      case "Pending":
        return (
          <span className="flex items-center gap-1 text-yellow-600 font-medium">
            <Clock size={16} /> {status}
          </span>
        );
      case "Cancelled":
        return (
          <span className="flex items-center gap-1 text-red-600 font-medium">
            <XCircle size={16} /> {status}
          </span>
        );
      default:
        return status;
    }
  };

    return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Package size={24} className="text-[#075E54]" /> Orders
        </h1>
        <button className="px-4 py-2 bg-[#128C7E] text-white rounded-lg hover:bg-[#0d7a6e]">
          + New Order
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl shadow border border-gray-100">
          <p className="text-sm text-gray-500">Total Orders</p>
          <h3 className="text-xl font-semibold text-gray-800 mt-1">
            {orders.length}
          </h3>
        </div>

        <div className="p-4 bg-white rounded-xl shadow border border-gray-100">
          <p className="text-sm text-gray-500">Completed</p>
          <h3 className="text-xl font-semibold text-green-600 mt-1">
            {orders.filter((o) => o.status === "Completed").length}
          </h3>
        </div>

        <div className="p-4 bg-white rounded-xl shadow border border-gray-100">
          <p className="text-sm text-gray-500">Pending</p>
          <h3 className="text-xl font-semibold text-yellow-600 mt-1">
            {orders.filter((o) => o.status === "Pending").length}
          </h3>
        </div>

        <div className="p-4 bg-white rounded-xl shadow border border-gray-100">
          <p className="text-sm text-gray-500">Cancelled</p>
          <h3 className="text-xl font-semibold text-red-600 mt-1">
            {orders.filter((o) => o.status === "Cancelled").length}
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Order ID</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Customer</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Amount</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3 text-gray-800">{order.id}</td>
                <td className="px-6 py-3 text-gray-700">{order.customer}</td>
                <td className="px-6 py-3 font-medium text-gray-900">
                  ₦{order.amount.toLocaleString()}
                </td>
                <td className="px-6 py-3">{getStatusBadge(order.status)}</td>
                <td className="px-6 py-3 text-gray-500 text-sm">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
