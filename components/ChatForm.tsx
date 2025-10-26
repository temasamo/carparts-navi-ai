"use client";
import { useState } from "react";
import { AffButton } from "./AffButton";

export default function ChatForm() {
  const [part, setPart] = useState("");
  const [car, setCar] = useState("");
  const [year, setYear] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const query = `${car} ${year} ${part}`;

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-2xl shadow">
      <h1 className="text-xl font-bold mb-4">🚗 AIパーツナビ</h1>

      {!submitted ? (
        <>
          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="探している部品（例：オイルフィルター）"
            value={part}
            onChange={(e) => setPart(e.target.value)}
          />
          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="車名（例：プリウス）"
            value={car}
            onChange={(e) => setCar(e.target.value)}
          />
          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="年式（例：2018）"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            onClick={() => setSubmitted(true)}
          >
            検索する
          </button>
        </>
      ) : (
        <div className="text-center">
          <p className="mb-3">
            🔍「{car}（{year}年式）」の「{part}」を検索します。
          </p>
          <AffButton mall="yorost" brand="YORO STORE" query={query} />
        </div>
      )}
    </div>
  );
}



