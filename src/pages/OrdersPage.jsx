import React, { useState } from "react";
import OrderModal from "../components/OrderModal.jsx";
import OrderCard from "../components/OrderCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { Plus } from "lucide-react";

export default function OrdersPage() {
  // Demo orders
  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: "Jane Doe",
      product: "Red Sneakers",
      quantity: 1,
      total: 25000,
      status: "Processing",
      date: "2025-02-01",
    },
    {
      id: 2,
      customer: "Tech Gadgets",
      product: "Bluetooth Speaker",
      quantity: 2,
      total: 56000,
      status: "Completed",
      date: "2025-02-10",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    status: "All",
    date: "",
  });

  // Add new order
  const handleSaveOrder = (newOrder) => {
    setOrders((prev) => [
      { id: prev.length + 1, ...newOrder },
      ...prev,
    ]);
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const statusMatch =
      filters.status === "All" || order.status === filters.status;
    const dateMatch = filters.date === "" || order.date === filters.date;
    return statusMatch && dateMatch;
  });

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#128C7E] text-white px-4 py-2 rounded-lg hover:bg-[#0d7a6e]"
        >
          <Plus size={20} /> New Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value }))
          }
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#128C7E]"
        >
          <option>All</option>
          <option>Processing</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>

        {/* Date Filter */}
        <input
          type="date"
          value={filters.date}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, date: e.target.value }))
          }
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#128C7E]"
        />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="text-gray-500 text-center py-10">
            No orders found.
          </div>
        )}
      </div>

      {/* Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOrder}
      />

      {/* Pagination */}
      <div className="mt-8">
        <Pagination totalItems={filteredOrders.length} itemsPerPage={5} />
      </div>
    </div>
  );
}
