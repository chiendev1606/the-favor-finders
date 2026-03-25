"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type Participant = { id: number; nickname: string };
type Vote = { participantId: number };

const HUNGRY_MESSAGES = [
  "still deciding... 🤔",
  "must be really hungry to take this long 🍽️",
  "probably drooling over the menu 🤤",
  "need a nudge! 👉",
  "making everyone wait... ⏳",
  "better pick before we eat without them! 😤",
  "having an existential food crisis 🫠",
  "stomach is growling but brain is frozen 🧊",
];

const LAST_ONE_MESSAGES = [
  "Everyone's waiting for you, {name}! 👀",
  "C'mon {name}, we're starving here! 🍜",
  "{name} holds the fate of lunch... ⚡",
  "The kitchen is getting cold, {name}! 🥶",
  "Last vote standing: {name} 🎯",
  "No pressure {name}... just ALL of it 😅",
  "{name} is the chosen one. Choose wisely! 🔮",
];

export function VoteNudge({
  participants,
  votes,
}: {
  participants: Participant[];
  votes: Vote[];
}) {
  const [msgIndex, setMsgIndex] = useState(0);
  const votedIds = new Set(votes.map((v) => v.participantId));
  const notVoted = participants.filter((p) => !votedIds.has(p.id));

  useEffect(() => {
    if (notVoted.length === 0) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => i + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, [notVoted.length]);

  if (notVoted.length === 0 || notVoted.length === participants.length) return null;

  const isLastOne = notVoted.length === 1;

  return (
    <div className="text-center py-1.5 sm:py-2 shrink-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={msgIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
        >
          {isLastOne ? (
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Badge variant="outline" className="text-xs animate-pulse px-3 py-1">
                {LAST_ONE_MESSAGES[msgIndex % LAST_ONE_MESSAGES.length].replace("{name}", notVoted[0].nickname)}
              </Badge>
            </motion.div>
          ) : (
            <Badge variant="outline" className="text-xs px-3 py-1">
              <span className="font-semibold">{notVoted.map((p) => p.nickname).join(", ")}</span>
              {" "}{HUNGRY_MESSAGES[msgIndex % HUNGRY_MESSAGES.length]}
            </Badge>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
