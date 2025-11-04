"use client";

import { useState } from "react";

export default function OilFilterChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string; url?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/oilfilter-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      const data = await res.json();

      if (data.results && data.results.length > 0) {
        // 商品データをAI回答として追加
        const item = data.results[0];
        const msg = {
          role: "assistant",
          content: `『${data.carInfo.model}』には ${item.name}（${item.price}）が適合します。`,
          url: item.url,
        };
        setMessages((prev) => [...prev, msg]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "該当するオイルフィルターが見つかりませんでした。" },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "エラーが発生しました。" },
      ]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-4 border border-gray-200">
        <h1 className="text-xl font-bold text-center mb-4 text-gray-800">
          🚗 ヨロストAIパーツ診断（オイルフィルター版）
        </h1>

        <div className="h-96 overflow-y-auto border p-3 rounded-lg bg-gray-100 mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`my-2 p-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-100 text-right"
                  : "bg-green-100 text-left"
              }`}
            >
              <p>{msg.content}</p>

              {/* 🔗 商品ページリンク */}
              {msg.role === "assistant" && msg.url && (
                <a
                  href={msg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 bg-orange-500 text-white text-sm px-3 py-1 rounded-lg hover:bg-orange-600"
                >
                  ▶ ヨロスト商品ページを見る
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg p-2"
            placeholder="例：アクアのオイルフィルターを教えて"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "送信中..." : "送信"}
          </button>
        </div>
      </div>
    </div>
  );
}
