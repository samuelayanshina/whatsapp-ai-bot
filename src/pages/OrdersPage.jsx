import React, { useState } from "react";
import { ShoppingBag, CheckCircle, Clock, XCircle } from "lucide-react";
import OrderModal from "../components/OrderModal.jsx";
import Toast from "../components/Toast.jsx";

export default function OrdersPage() {
  const [orders, setOrders] = useState([
    { id: "ORD-2001", customer: "Jane’s Fashion Store", product: "T-shirt", quantity: 20, total: 25000, status: "Completed", date: "2025-11-07" },
    { id: "ORD-2002", customer: "Divine Bakery", product: "Birthday Cake", quantity: 2, total: 9200, status: "Processing", date: "2025-11-08" },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const getStatusTag = (status) => {
    switch (status) {
      case "Completed":
        return <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle size={16} /> Completed</span>;
      case "Processing":
        return <span className="flex items-center gap-1 text-yellow-600 font-medium"><Clock size={16} /> Processing</span>;
      case "Cancelled":
        return <span className="flex items-center gap-1 text-red-600 font-medium"><XCircle size={16} /> Cancelled</span>;
      default:
        return status;
    }
  };

  const handleSaveOrder = (newOrder) => {
    const newId = `ORD-${2000 + orders.length + 1}`;
    setOrders((prev) => [{ id: newId, ...newOrder }, ...prev]);
    setToast({ message: "✅ Order created successfully!", type: "success" });
  };

  return (
    <div className="p-6 space-y-6 relative">
      {/* ✅ Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOrder}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <ShoppingBag size={24} className="text-[#075E54]" /> Orders
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#128C7E] text-white rounded-lg hover:bg-[#0d7a6e]"
        >
          + New Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Order ID</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Customer</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Product</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Quantity</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Total</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 text-gray-800">{order.id}</td>
                <td className="px-6 py-3 text-gray-700">{order.customer}</td>
                <td className="px-6 py-3 text-gray-700">{order.product}</td>
                <td className="px-6 py-3 text-gray-700">{order.quantity}</td>
                <td className="px-6 py-3 font-medium text-gray-900">₦{order.total.toLocaleString()}</td>
                <td className="px-6 py-3">{getStatusTag(order.status)}</td>
                <td className="px-6 py-3 text-gray-500 text-sm">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
