"use client";

import { useState } from "react";

export function NicknameModal({
  roomCode,
  onJoined,
}: {
  roomCode: string;
  onJoined: (participantId: number) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch(`/api/rooms/${roomCode}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: nickname.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to join");
      setLoading(false);
      return;
    }

    const data = await res.json();
    localStorage.setItem(`participant-${roomCode}`, String(data.participantId));
    onJoined(data.participantId);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-orange-600">
            Join The Flavor Finders
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter your nickname to join room{" "}
            <span className="font-mono font-bold tracking-widest">{roomCode}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-center text-lg"
            autoFocus
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium text-lg cursor-pointer"
          >
            {loading ? "Joining..." : "Join Room"}
          </button>
        </form>
      </div>
    </div>
  );
}
