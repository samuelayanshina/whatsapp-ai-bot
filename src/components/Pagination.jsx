import React, { useState } from "react";

export default function Pagination({ totalItems, itemsPerPage = 5 }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={prevPage}
        disabled={page === 1}
        className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
      >
        Prev
      </button>

      <span className="text-gray-700">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={nextPage}
        disabled={page === totalPages}
        className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
