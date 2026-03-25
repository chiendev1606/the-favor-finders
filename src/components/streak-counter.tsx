"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BADGES = [
  { min: 1, label: "🥉 Bronze Foodie", color: "bg-amber-600" },
  { min: 3, label: "🥈 Silver Chef", color: "bg-gray-400" },
  { min: 5, label: "🥇 Gold Gourmet", color: "bg-yellow-500" },
  { min: 10, label: "💎 Diamond Diner", color: "bg-cyan-500" },
  { min: 20, label: "👑 Legendary Taster", color: "bg-purple-500" },
];

export function StreakCounter() {
  const [streak, setStreak] = useState(0);
  const [badge, setBadge] = useState<typeof BADGES[0] | null>(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem("flavor-finders-streak") || '{"count":0,"lastDate":""}');

    if (data.lastDate === today) {
      setStreak(data.count);
    } else {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newCount = data.lastDate === yesterday ? data.count + 1 : 1;
      localStorage.setItem("flavor-finders-streak", JSON.stringify({ count: newCount, lastDate: today }));
      setStreak(newCount);
    }
  }, []);

  useEffect(() => {
    const earned = [...BADGES].reverse().find((b) => streak >= b.min);
    setBadge(earned || null);
  }, [streak]);

  if (streak === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className="text-xs gap-1">
            🔥 {streak} day{streak !== 1 ? "s" : ""}
            {badge && <span>{badge.label.split(" ")[0]}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold text-sm">Streak: {streak} day{streak !== 1 ? "s" : ""}</p>
            {badge && <p className="text-xs">{badge.label}</p>}
            <p className="text-[10px] text-muted-foreground">
              Next: {BADGES.find((b) => b.min > streak)?.label || "Max reached!"}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
