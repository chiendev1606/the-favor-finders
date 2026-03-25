"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const TIMER_OPTIONS = [
  { label: "No limit", value: 0 },
  { label: "1 min", value: 1 },
  { label: "3 min", value: 3 },
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
];

export function CreateRoomForm() {
  const [nickname, setNickname] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;

    setLoading(true);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: nickname.trim(),
        expiresInMinutes: expiresInMinutes || undefined,
      }),
    });
    const data = await res.json();

    localStorage.setItem(`participant-${data.code}`, String(data.participantId));
    router.push(`/room/${data.code}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Your nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Session timer</Label>
        <div className="flex flex-wrap gap-1.5">
          {TIMER_OPTIONS.map((opt) => (
            <Badge
              key={opt.value}
              variant={expiresInMinutes === opt.value ? "default" : "outline"}
              className={`cursor-pointer text-xs ${
                expiresInMinutes === opt.value
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "hover:bg-accent"
              }`}
              onClick={() => setExpiresInMinutes(opt.value)}
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600">
        {loading ? "Creating..." : "Create Room"}
      </Button>
    </form>
  );
}
