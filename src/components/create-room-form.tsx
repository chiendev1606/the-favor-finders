"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const QUICK_OPTIONS = [
  { label: "No limit", value: 0 },
  { label: "1 min", value: 1 },
  { label: "3 min", value: 3 },
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "30 min", value: 30 },
];

export function CreateRoomForm() {
  const [nickname, setNickname] = useState("");
  const [timerMode, setTimerMode] = useState<"quick" | "exact">("quick");
  const [quickMinutes, setQuickMinutes] = useState(0);
  const [exactDate, setExactDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [exactTime, setExactTime] = useState(() => {
    const d = new Date(Date.now() + 30 * 60000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;

    let deadlineUtc: string | undefined;

    if (timerMode === "quick" && quickMinutes > 0) {
      // Convert minutes to UTC deadline
      deadlineUtc = new Date(Date.now() + quickMinutes * 60 * 1000).toISOString();
    } else if (timerMode === "exact" && exactDate && exactTime) {
      // Combine date + time (local) and convert to UTC
      const localDate = new Date(`${exactDate}T${exactTime}`);
      if (localDate.getTime() > Date.now()) {
        deadlineUtc = localDate.toISOString();
      }
    }

    setLoading(true);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: nickname.trim(),
        deadlineUtc,
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

        {/* Mode toggle */}
        <div className="flex gap-1.5 mb-2">
          <Badge
            variant={timerMode === "quick" ? "default" : "outline"}
            className={`cursor-pointer text-xs ${timerMode === "quick" ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-accent"}`}
            onClick={() => setTimerMode("quick")}
          >
            Quick
          </Badge>
          <Badge
            variant={timerMode === "exact" ? "default" : "outline"}
            className={`cursor-pointer text-xs ${timerMode === "exact" ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-accent"}`}
            onClick={() => { setTimerMode("exact"); setQuickMinutes(0); }}
          >
            Exact time
          </Badge>
        </div>

        {timerMode === "quick" ? (
          <div className="flex flex-wrap gap-1.5">
            {QUICK_OPTIONS.map((opt) => (
              <Badge
                key={opt.value}
                variant={quickMinutes === opt.value ? "default" : "outline"}
                className={`cursor-pointer text-xs ${
                  quickMinutes === opt.value
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "hover:bg-accent"
                }`}
                onClick={() => setQuickMinutes(opt.value)}
              >
                {opt.label}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={exactDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setExactDate(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Time</Label>
                <Input
                  type="time"
                  value={exactTime}
                  onChange={(e) => setExactTime(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Room will auto-close at this time
            </p>
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600">
        {loading ? "Creating..." : "Create Room"}
      </Button>
    </form>
  );
}
