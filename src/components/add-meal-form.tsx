"use client";

import { useState } from "react";

export function AddMealForm({ roomCode }: { roomCode: string }) {
  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameVi.trim() || !nameEn.trim()) return;

    await fetch(`/api/rooms/${roomCode}/meals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameVi, nameEn }),
    });

    setNameVi("");
    setNameEn("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Vietnamese name"
        value={nameVi}
        onChange={(e) => setNameVi(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        required
      />
      <input
        type="text"
        placeholder="English name"
        value={nameEn}
        onChange={(e) => setNameEn(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        required
      />
      <button
        type="submit"
        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 cursor-pointer"
      >
        Add
      </button>
    </form>
  );
}
