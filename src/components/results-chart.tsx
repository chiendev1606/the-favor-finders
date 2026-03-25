"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null; description: string | null; tags: string | null; lat: number | null; lng: number | null };
type Vote = { participantId: number; mealId: number };
type Participant = { id: number; nickname: string };

export function ResultsChart({
  meals,
  votes,
  participants,
}: {
  meals: Meal[];
  votes: Vote[];
  participants: Participant[];
}) {
  const totalVotes = votes.length;

  const voteCounts = meals.map((meal) => ({
    meal,
    count: votes.filter((v) => v.mealId === meal.id).length,
    voters: votes
      .filter((v) => v.mealId === meal.id)
      .map((v) => participants.find((p) => p.id === v.participantId)?.nickname)
      .filter(Boolean),
  }));

  const sorted = [...voteCounts].sort((a, b) => b.count - a.count);
  const maxCount = sorted[0]?.count || 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Results</CardTitle>
        <AnimatePresence mode="wait">
          {totalVotes > 0 && (
            <motion.div
              key={totalVotes}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <Badge variant="secondary">
                {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-0">
        {totalVotes === 0 ? (
          <div className="text-center py-6">
            <motion.div
              className="text-4xl mb-2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🗳️
            </motion.div>
            <p className="text-muted-foreground text-sm">No votes yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sorted.map(({ meal, count, voters }, index) => {
                const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                const isWinner = count === maxCount && count > 0;

                return (
                  <motion.div
                    key={meal.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ layout: { type: "spring", damping: 20, stiffness: 200 }, delay: index * 0.03 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      {meal.image && (
                        <Image src={meal.image} alt={meal.nameVi} width={24} height={24} className="w-6 h-6 object-cover rounded shrink-0" />
                      )}
                      <span className={`text-sm font-medium flex-1 truncate ${isWinner ? "text-orange-600 dark:text-orange-400" : ""}`}>
                        {meal.nameVi}{" "}
                        <span className="text-muted-foreground font-normal">({meal.nameEn})</span>
                      </span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={count}
                          initial={{ scale: 1.4, color: "#f97316" }}
                          animate={{ scale: 1, color: "inherit" }}
                          className="text-sm font-semibold shrink-0"
                        >
                          {count}
                        </motion.span>
                      </AnimatePresence>
                      {isWinner && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <Badge className="bg-orange-500 hover:bg-orange-500 shrink-0 text-xs">Winner</Badge>
                        </motion.div>
                      )}
                    </div>
                    <motion.div
                      initial={false}
                      animate={{ opacity: 1 }}
                    >
                      <Progress value={percentage} className="h-3" />
                    </motion.div>
                    {voters.length > 0 && (
                      <motion.p
                        key={voters.join(",")}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-muted-foreground"
                      >
                        {voters.join(", ")}
                      </motion.p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
