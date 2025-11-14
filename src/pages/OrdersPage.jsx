import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import OrderModal from "../components/OrderModal.jsx";
import OrderCard from "../components/OrderCard.jsx";
import Pagination from "../components/Pagination.jsx";
import TopNav from "../components/TopNav.jsx";

export default function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addOrder = (order) => {
    setOrders((prev) => [...prev, { id: Date.now(), ...order }]);
  };

  return (
    <>
      {/* 🔥 Add back arrow */}
      <TopNav
        showBack={true}
        onBack={() => navigate(-1)}
        title="Orders"
      />

      <div className="pt-[72px] px-4 sm:px-6 pb-6">
        {/* Header actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">All Orders</h1>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#128C7E] text-white px-4 py-2 rounded-lg hover:bg-[#0d7a6e]"
          >
            <Plus size={20} /> New Order
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No orders yet</p>
          ) : (
            orders.map((order) => (
              <OrderCard key={order.id} data={order} />
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination totalItems={orders.length} itemsPerPage={5} />

        {/* Modal */}
        <OrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addOrder}
        />
      </div>
    </>
  );
}
