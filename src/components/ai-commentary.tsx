"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type VoteSummaryItem = {
  meal: { id: number; nameVi: string; nameEn: string; image: string | null };
  count: number;
  percentage: number;
  voters: string[];
};

export function AiCommentary({
  winnerMeal,
  totalVotes,
  totalParticipants,
  summary,
}: {
  winnerMeal: string;
  totalVotes: number;
  totalParticipants: number;
  summary: VoteSummaryItem[];
}) {
  const [commentary, setCommentary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!winnerMeal || summary.length === 0) return;

    fetch("/api/ai/commentary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerMeal, totalVotes, totalParticipants, summary }),
    })
      .then((r) => r.json())
      .then((data) => {
        setCommentary(data.commentary);
        setLoading(false);
      })
      .catch(() => {
        setCommentary("The people have spoken! 🍜");
        setLoading(false);
      });
  }, [winnerMeal, totalVotes, totalParticipants, summary]);

  if (loading) {
    return (
      <motion.div
        className="flex items-center gap-2 text-xs text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span>🤖</span>
        <span>AI is writing commentary...</span>
      </motion.div>
    );
  }

  if (!commentary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800"
    >
      <span className="text-lg shrink-0">🤖</span>
      <p className="text-xs sm:text-sm text-foreground italic">{commentary}</p>
    </motion.div>
  );
}
