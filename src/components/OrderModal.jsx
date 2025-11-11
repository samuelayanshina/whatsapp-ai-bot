import React, { useState } from "react";
import { X } from "lucide-react";

export default function OrderModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    customer: "",
    product: "",
    quantity: 1,
    total: "",
    status: "Processing",
    date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customer || !form.product || !form.total)
      return alert("Please fill in all fields");
    onSave(form);
    onClose();
    setForm({
      customer: "",
      product: "",
      quantity: 1,
      total: "",
      status: "Processing",
      date: new Date().toISOString().split("T")[0],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">New Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Customer Name</label>
            <input
              type="text"
              name="customer"
              value={form.customer}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#128C7E] focus:outline-none"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Product</label>
            <input
              type="text"
              name="product"
              value={form.product}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#128C7E] focus:outline-none"
              placeholder="Product ordered"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#128C7E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Total (₦)</label>
              <input
                type="number"
                name="total"
                value={form.total}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#128C7E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#128C7E] focus:outline-none"
            >
              <option>Processing</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#128C7E] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#128C7E] text-white rounded-lg hover:bg-[#0d7a6e]"
            >
              Save Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
