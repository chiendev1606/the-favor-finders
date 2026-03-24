"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinRoomForm() {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !nickname.trim()) return;

    setLoading(true);
    setError("");

    const roomCode = code.trim().toUpperCase();
    const res = await fetch(`/api/rooms/${roomCode}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: nickname.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to join room");
      setLoading(false);
      return;
    }

    const data = await res.json();
    localStorage.setItem(`participant-${roomCode}`, String(data.participantId));
    router.push(`/room/${roomCode}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Room code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 uppercase tracking-widest text-center"
        maxLength={6}
        required
      />
      <input
        type="text"
        placeholder="Your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 font-medium cursor-pointer"
      >
        {loading ? "Joining..." : "Join Room"}
      </button>
    </form>
  );
}
