"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <Dialog open={true}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-orange-600">Join The Flavor Finders</DialogTitle>
          <DialogDescription>
            Enter your nickname to join room{" "}
            <span className="font-mono font-bold tracking-widest">{roomCode}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              autoFocus
              required
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600">
            {loading ? "Joining..." : "Join Room"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
