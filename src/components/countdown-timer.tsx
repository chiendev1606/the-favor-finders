"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function CountdownTimer({
  roomCode,
  deadline,
  onTimeUp,
}: {
  roomCode: string;
  deadline: string | Date | null;
  onTimeUp: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [setting, setSetting] = useState(false);
  const firedRef = useRef(false);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (!deadline) {
      setTimeLeft(null);
      firedRef.current = false;
      return;
    }

    const deadlineMs = new Date(deadline).getTime();
    const now = Date.now();
    const total = deadlineMs - now;

    if (total <= 0) {
      setTimeLeft(0);
      if (!firedRef.current) {
        firedRef.current = true;
        onTimeUpRef.current();
      }
      return;
    }

    setTotalTime(total);
    setTimeLeft(total);
    firedRef.current = false;

    const interval = setInterval(() => {
      const remaining = deadlineMs - Date.now();
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        if (!firedRef.current) {
          firedRef.current = true;
          onTimeUpRef.current();
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [deadline]);

  const handleSetDeadline = useCallback(async (minutes: number) => {
    setSetting(true);
    await fetch(`/api/rooms/${roomCode}/deadline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes }),
    });
    setSetting(false);
  }, [roomCode]);

  // No deadline set and no timer — show set buttons
  if (!deadline) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground hidden md:inline">Timer:</span>
        {[1, 3, 5].map((m) => (
          <Button
            key={m}
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={() => handleSetDeadline(m)}
            disabled={setting}
          >
            {m}m
          </Button>
        ))}
      </div>
    );
  }

  if (timeLeft === null) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 100;
  const isUrgent = timeLeft > 0 && timeLeft < 30000;

  if (timeLeft <= 0) {
    return (
      <Badge className="bg-red-500 hover:bg-red-500 animate-pulse text-sm px-3 py-1">
        Time&apos;s up!
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Progress value={progress} className="w-16 h-2" />
      <Badge variant={isUrgent ? "destructive" : "secondary"} className={`font-mono text-sm ${isUrgent ? "animate-pulse" : ""}`}>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </Badge>
    </div>
  );
}
