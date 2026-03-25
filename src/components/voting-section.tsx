"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null; description: string | null; tags: string | null; lat: number | null; lng: number | null };

const LOADING_MESSAGES = [
  { emoji: "🍜", text: "Warming up the broth..." },
  { emoji: "🥢", text: "Sharpening the chopsticks..." },
  { emoji: "👨‍🍳", text: "Consulting the chef..." },
  { emoji: "🔥", text: "Firing up the wok..." },
  { emoji: "🌶️", text: "Adding a pinch of spice..." },
  { emoji: "🥡", text: "Packing your order..." },
  { emoji: "✨", text: "Sprinkling some magic..." },
  { emoji: "🍳", text: "Cracking the eggs..." },
];

export function VotingSection({
  meals,
  roomCode,
  participantId,
  currentVoteMealId,
  isFinished,
}: {
  meals: Meal[];
  roomCode: string;
  participantId: number | null;
  currentVoteMealId: number | null;
  isFinished?: boolean;
}) {
  const [votingMealId, setVotingMealId] = useState<number | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  async function handleVote(mealId: number) {
    if (!participantId || votingMealId !== null || isFinished) return;

    setVotingMealId(mealId);
    setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);

    const msgInterval = setInterval(() => {
      setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 800);

    try {
      await fetch(`/api/rooms/${roomCode}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, mealId }),
      });
    } finally {
      clearInterval(msgInterval);
      setVotingMealId(null);
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {isFinished ? "Voting Ended" : "Pick Your Meal"}
          {isFinished && <Badge variant="secondary" className="text-xs">Closed</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-0 relative">
        {/* Finished overlay */}
        {isFinished && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl sm:text-5xl mb-2"
            >
              🏁
            </motion.div>
            <p className="text-sm font-medium text-muted-foreground">Voting has ended</p>
            <p className="text-xs text-muted-foreground mt-1">Check the results!</p>
          </div>
        )}

        {/* Loading overlay */}
        <AnimatePresence>
          {votingMealId !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm sm:absolute sm:inset-0 sm:z-10 sm:rounded-lg"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-6xl sm:text-5xl mb-4 sm:mb-3"
              >
                {loadingMsg.emoji}
              </motion.div>
              <motion.p
                key={loadingMsg.text}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-base sm:text-sm font-medium text-orange-600 dark:text-orange-400 px-4 text-center"
              >
                {loadingMsg.text}
              </motion.p>
              <div className="flex gap-1.5 sm:gap-1 mt-4 sm:mt-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full bg-orange-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TooltipProvider>
          <div className="grid gap-2 content-start">
            {meals.map((meal) => {
              const isSelected = currentVoteMealId === meal.id;
              const isVoting = votingMealId === meal.id;
              return (
                <Tooltip key={meal.id}>
                  <TooltipTrigger className="w-full">
                    <motion.button
                      onClick={() => handleVote(meal.id)}
                      disabled={votingMealId !== null || isFinished}
                      whileTap={votingMealId === null && !isFinished ? { scale: 0.97 } : undefined}
                      className={`w-full flex items-center gap-2 md:gap-3 text-left px-3 py-2.5 rounded-lg border transition-all ${
                        isFinished
                          ? "border-border opacity-60 cursor-default"
                          : isVoting
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 ring-2 ring-orange-300 animate-pulse cursor-wait"
                            : isSelected
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 ring-2 ring-orange-200 cursor-pointer"
                              : votingMealId !== null
                                ? "border-border opacity-50 cursor-wait"
                                : "border-border hover:border-orange-200 hover:bg-accent cursor-pointer"
                      }`}
                    >
                      {meal.image && (
                        <Image src={meal.image} alt={meal.nameVi} width={40} height={40} className="w-8 h-8 md:w-10 md:h-10 object-cover rounded shrink-0" />
                      )}
                      <div className="min-w-0 flex-1 text-left">
                        <span className="font-medium text-sm">{meal.nameVi}</span>
                        <span className="text-muted-foreground ml-1 text-xs">({meal.nameEn})</span>
                      </div>
                      {isVoting ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="text-lg shrink-0"
                        >
                          🍜
                        </motion.span>
                      ) : isSelected ? (
                        <Badge className="bg-orange-500 hover:bg-orange-500 shrink-0">Voted</Badge>
                      ) : null}
                    </motion.button>
                  </TooltipTrigger>
                  {meal.description && (
                    <TooltipContent side="top" className="max-w-[280px] sm:max-w-xs">
                      <div className="space-y-1.5">
                        {meal.image && (
                          <Image src={meal.image} alt={meal.nameVi} width={200} height={120} className="w-full h-24 object-cover rounded-md" />
                        )}
                        <p className="font-semibold text-sm">{meal.nameVi}</p>
                        <p className="text-xs leading-relaxed">{meal.description}</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
