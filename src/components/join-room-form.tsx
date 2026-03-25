"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <Input
        type="text"
        placeholder="Room code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="uppercase tracking-widest text-center"
        maxLength={6}
        required
      />
      <Input
        type="text"
        placeholder="Your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        required
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button type="submit" disabled={loading} variant="secondary" className="w-full bg-teal-500 hover:bg-teal-600 text-white">
        {loading ? "Joining..." : "Join Room"}
      </Button>
    </form>
  );
}
