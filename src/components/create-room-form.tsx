"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateRoomForm() {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;

    setLoading(true);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: nickname.trim() }),
    });
    const data = await res.json();

    localStorage.setItem(`participant-${data.code}`, String(data.participantId));
    router.push(`/room/${data.code}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium cursor-pointer"
      >
        {loading ? "Creating..." : "Create Room"}
      </button>
    </form>
  );
}
