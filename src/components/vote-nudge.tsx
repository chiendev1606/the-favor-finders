"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type Participant = { id: number; nickname: string };
type Vote = { participantId: number };

export function VoteNudge({
  participants,
  votes,
}: {
  participants: Participant[];
  votes: Vote[];
}) {
  const votedIds = new Set(votes.map((v) => v.participantId));
  const notVoted = participants.filter((p) => !votedIds.has(p.id));

  if (notVoted.length === 0 || notVoted.length === participants.length) return null;

  const isLastOne = notVoted.length === 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-2"
      >
        {isLastOne ? (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Badge variant="outline" className="text-xs animate-pulse">
              ⏳ Waiting for <span className="font-bold">{notVoted[0].nickname}</span>...
            </Badge>
          </motion.div>
        ) : (
          <Badge variant="outline" className="text-xs">
            {notVoted.length} haven&apos;t voted: {notVoted.map((p) => p.nickname).join(", ")}
          </Badge>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
