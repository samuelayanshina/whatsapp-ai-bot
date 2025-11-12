import React, { useState } from "react";
import { FileText, Download, CheckCircle, Clock, XCircle } from "lucide-react";
import jsPDF from "jspdf";
import InvoiceModal from "../components/InvoiceModal.jsx"; // ✅ import modal

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([
    { id: "INV-5001", client: "Jane’s Fashion Store", total: 14500, status: "Paid", date: "2025-11-08" },
    { id: "INV-5002", client: "Divine Bakery", total: 9200, status: "Pending", date: "2025-11-09" },
    { id: "INV-5003", client: "Tech Universe", total: 19800, status: "Overdue", date: "2025-11-06" },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusTag = (status) => {
    switch (status) {
      case "Paid":
        return <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle size={16} /> Paid</span>;
      case "Pending":
        return <span className="flex items-center gap-1 text-yellow-600 font-medium"><Clock size={16} /> Pending</span>;
      case "Overdue":
        return <span className="flex items-center gap-1 text-red-600 font-medium"><XCircle size={16} /> Overdue</span>;
      default:
        return status;
    }
  };

  const handleDownloadPDF = (invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Vendor Business Dashboard", 14, 20);
    doc.setFontSize(12);
    doc.text("Invoice Receipt", 14, 30);
    doc.line(14, 32, 196, 32);
    doc.text(`Invoice ID: ${invoice.id}`, 14, 45);
    doc.text(`Client: ${invoice.client}`, 14, 52);
    doc.text(`Date: ${invoice.date}`, 14, 59);
    doc.text(`Status: ${invoice.status}`, 14, 66);
    doc.setFontSize(14);
    doc.text("Amount Summary", 14, 85);
    doc.line(14, 87, 196, 87);
    doc.setFontSize(12);
    doc.text(`Total: ₦${invoice.total.toLocaleString()}`, 14, 100);
    doc.save(`${invoice.id}.pdf`);
  };

  // ✅ Handle new invoice from modal
  const handleSaveInvoice = (newData) => {
    const newInvoice = {
      id: `INV-${5000 + invoices.length + 1}`,
      ...newData,
      total: Number(newData.total),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Modal */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveInvoice}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <FileText size={24} className="text-[#075E54]" /> Invoices
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#128C7E] text-white rounded-lg hover:bg-[#0d7a6e]"
        >
          + New Invoice
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Invoice ID</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Client</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Total</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 text-gray-800">{inv.id}</td>
                <td className="px-6 py-3 text-gray-700">{inv.client}</td>
                <td className="px-6 py-3 font-medium text-gray-900">₦{inv.total.toLocaleString()}</td>
                <td className="px-6 py-3">{getStatusTag(inv.status)}</td>
                <td className="px-6 py-3 text-gray-500 text-sm">{inv.date}</td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => handleDownloadPDF(inv)}
                    className="flex items-center gap-1 text-[#128C7E] hover:underline"
                  >
                    <Download size={16} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
