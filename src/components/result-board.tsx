"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AiCommentary } from "@/components/ai-commentary";

type VoteSummaryItem = {
  meal: { id: number; nameVi: string; nameEn: string; image: string | null };
  count: number;
  percentage: number;
  voters: string[];
};

const MEDALS = ["🥇", "🥈", "🥉"];

export function ResultBoard({
  show,
  summary,
  totalParticipants,
  onClose,
}: {
  show: boolean;
  summary: VoteSummaryItem[];
  totalParticipants: number;
  onClose: () => void;
}) {
  if (!show || summary.length === 0) return null;

  const winner = summary[0];
  const totalVotes = summary.reduce((a, b) => a + b.count, 0);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <Card className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Header */}
              <div className="text-center">
                <motion.div
                  className="text-5xl sm:text-6xl mb-2"
                  animate={{ rotate: [0, -8, 8, -5, 5, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: 1 }}
                >
                  🏆
                </motion.div>
                <h2 className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  Final Results
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalVotes} vote{totalVotes !== 1 ? "s" : ""} from {totalParticipants} participant{totalParticipants !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Winner spotlight */}
              {winner && winner.count > 0 && (
                <motion.div
                  className="text-center p-4 sm:p-5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {winner.meal.image && (
                    <motion.div
                      className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden mb-3"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <Image src={winner.meal.image} alt={winner.meal.nameVi} width={96} height={96} className="w-full h-full object-cover" />
                    </motion.div>
                  )}
                  <p className="text-lg sm:text-xl font-bold text-foreground">{winner.meal.nameVi}</p>
                  <p className="text-sm text-muted-foreground">{winner.meal.nameEn}</p>
                  <Badge className="mt-2 bg-orange-500 text-sm px-3 py-1">
                    Winner — {winner.count} vote{winner.count !== 1 ? "s" : ""} ({winner.percentage}%)
                  </Badge>
                </motion.div>
              )}

              {/* AI Commentary */}
              {winner && winner.count > 0 && (
                <AiCommentary
                  winnerMeal={`${winner.meal.nameVi} (${winner.meal.nameEn})`}
                  totalVotes={totalVotes}
                  totalParticipants={totalParticipants}
                  summary={summary}
                />
              )}

              {/* Full leaderboard */}
              <div className="space-y-3">
                {summary.map((item, i) => (
                  <motion.div
                    key={item.meal.id}
                    className="space-y-1.5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg w-7 text-center shrink-0">
                        {i < 3 ? MEDALS[i] : `#${i + 1}`}
                      </span>
                      {item.meal.image && (
                        <Image src={item.meal.image} alt={item.meal.nameVi} width={28} height={28} className="w-7 h-7 object-cover rounded shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className={`text-sm font-medium ${i === 0 ? "text-orange-600 dark:text-orange-400" : ""}`}>
                          {item.meal.nameVi}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">({item.meal.nameEn})</span>
                      </div>
                      <span className="text-sm font-semibold shrink-0">{item.count}</span>
                      <span className="text-xs text-muted-foreground shrink-0 w-10 text-right">{item.percentage}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-2.5" />
                    {item.voters.length > 0 && (
                      <p className="text-xs text-muted-foreground pl-9">{item.voters.join(", ")}</p>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button onClick={onClose} className="flex-1 bg-orange-500 hover:bg-orange-600">
                  Got it!
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
