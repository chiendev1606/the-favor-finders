"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ParticipantStat = {
  participantId: number;
  nickname: string;
  totalVotes: number;
  favorite: { name: string; count: number } | null;
  topMeals: { name: string; count: number }[];
};

const FUN_LABELS = [
  "You always pick {meal}! 🍜",
  "Loyal fan of {meal}! ❤️",
  "{meal} lover detected! 🔍",
  "Can't resist {meal}! 🤤",
  "{meal} is your comfort food! 🫂",
];

export function ParticipantStats({
  roomCode,
  currentParticipantId,
}: {
  roomCode: string;
  currentParticipantId: number | null;
}) {
  const [stats, setStats] = useState<ParticipantStat[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/rooms/${roomCode}/stats`)
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [roomCode]);

  if (!loaded || stats.length === 0) return null;

  // Only show stats for people who have history
  const withHistory = stats.filter((s) => s.totalVotes > 1 && s.favorite);
  if (withHistory.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence>
          {withHistory.map((s, i) => {
            const isMe = s.participantId === currentParticipantId;
            const label = FUN_LABELS[i % FUN_LABELS.length].replace("{meal}", s.favorite!.name);

            return (
              <Tooltip key={s.participantId}>
                <TooltipTrigger>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 ${isMe ? "border-orange-300 bg-orange-50 dark:bg-orange-950/20" : ""}`}
                    >
                      {isMe ? "You" : s.nickname}: {s.favorite!.name} ×{s.favorite!.count}
                    </Badge>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[220px]">
                  <div className="space-y-1">
                    <p className="text-xs font-medium">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{s.totalVotes} total votes across all rooms</p>
                    {s.topMeals.length > 1 && (
                      <div className="text-[10px] text-muted-foreground">
                        Top picks: {s.topMeals.map((m) => `${m.name} (${m.count})`).join(", ")}
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
