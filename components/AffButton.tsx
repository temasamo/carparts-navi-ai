"use client";
import React from "react";

interface Props {
  mall: string;
  brand: string;
  query: string;
}

export const AffButton: React.FC<Props> = ({ mall, brand, query }) => {
  const href = `/api/go/${mall}?q=${encodeURIComponent(query)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 mt-2"
    >
      {brand}をYORO STOREで探す
    </a>
  );
};
