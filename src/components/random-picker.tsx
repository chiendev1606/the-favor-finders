"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import confetti from "canvas-confetti";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null };

export function RandomPicker({
  roomCode,
  meals,
  participantId,
  isFinished,
}: {
  roomCode: string;
  meals: Meal[];
  participantId: number | null;
  isFinished?: boolean;
}) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<"rolling" | "reveal" | null>(null);
  const [shuffleMeal, setShuffleMeal] = useState<Meal | null>(null);
  const [result, setResult] = useState<Meal | null>(null);

  const handlePick = useCallback(async () => {
    if (meals.length === 0 || active) return;
    setActive(true);
    setPhase("rolling");
    setResult(null);

    let count = 0;
    const totalCycles = 25;
    let interval = 80;

    const tick = () => {
      setShuffleMeal(meals[count % meals.length]);
      count++;
      if (count < totalCycles) {
        interval = count > 15 ? interval + 40 : count > 10 ? interval + 15 : interval;
        setTimeout(tick, interval);
      }
    };
    tick();

    const res = await fetch(`/api/rooms/${roomCode}/random`, { method: "POST" });
    const meal = await res.json();

    setTimeout(() => {
      setShuffleMeal(null);
      setResult(meal);
      setPhase("reveal");

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
      }, 300);
    }, 3500);
  }, [meals, roomCode, active]);

  const handleLetsGo = useCallback(async () => {
    // Auto-vote for the random result
    if (result && participantId) {
      await fetch(`/api/rooms/${roomCode}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, mealId: result.id }),
      });
    }
    setActive(false);
    setPhase(null);
    setResult(null);
    setShuffleMeal(null);
  }, [result, participantId, roomCode]);

  const handleClose = () => {
    setActive(false);
    setPhase(null);
    setResult(null);
    setShuffleMeal(null);
  };

  return (
    <>
      <Button
        onClick={handlePick}
        disabled={active || meals.length === 0 || isFinished}
        className="w-full bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white font-semibold py-3 text-base"
      >
        🎲 Can&apos;t decide? Let fate choose!
      </Button>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-black/95 to-orange-900/95" />

            {phase === "rolling" && (
              <div className="relative z-10 text-center">
                <motion.div
                  className="text-6xl sm:text-8xl md:text-9xl mb-4 sm:mb-8"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 0.9, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 0.5, repeat: Infinity, ease: "linear" },
                    scale: { duration: 0.8, repeat: Infinity },
                  }}
                >
                  🎲
                </motion.div>

                <AnimatePresence mode="wait">
                  {shuffleMeal && (
                    <motion.div
                      key={shuffleMeal.id}
                      initial={{ y: 30, opacity: 0, scale: 0.8 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -30, opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.08 }}
                      className="space-y-3"
                    >
                      {shuffleMeal.image && (
                        <div className="mx-auto w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white/20">
                          <Image src={shuffleMeal.image} alt="" width={144} height={144} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-white text-2xl md:text-3xl font-bold">{shuffleMeal.nameVi}</p>
                      <p className="text-white/60 text-lg">{shuffleMeal.nameEn}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.p
                  className="text-white/40 text-sm mt-8"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Rolling the dice...
                </motion.p>
              </div>
            )}

            {phase === "reveal" && result && (
              <motion.div
                className="relative z-10 text-center px-6"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
              >
                <motion.div
                  className="text-5xl sm:text-7xl md:text-8xl mb-4"
                  animate={{ rotate: [0, -8, 8, -5, 5, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: 2 }}
                >
                  🎯
                </motion.div>

                <motion.p
                  className="text-yellow-400 text-lg md:text-xl font-medium mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Fate has spoken!
                </motion.p>

                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 max-w-sm mx-auto"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {result.image && (
                    <motion.div
                      className="mx-auto w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden mb-5 border-4 border-orange-400/50 shadow-2xl"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring" }}
                    >
                      <Image src={result.image} alt={result.nameVi} width={176} height={176} className="w-full h-full object-cover" />
                    </motion.div>
                  )}

                  <motion.h2
                    className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    {result.nameVi}
                  </motion.h2>
                  <motion.p
                    className="text-white/60 text-lg mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    {result.nameEn}
                  </motion.p>

                  <motion.div
                    className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <Button
                      onClick={handleLetsGo}
                      className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3"
                    >
                      Let&apos;s go! 🍜
                    </Button>
                    <Button
                      onClick={handleClose}
                      className="bg-white/20 hover:bg-white/30 text-white border-0 px-6 py-3 text-lg backdrop-blur"
                    >
                      🎲 Pick again
                    </Button>
                  </motion.div>
                </motion.div>

                {["🍜", "🥢", "🍲", "🥘", "🍛", "🍜", "🥟", "🍚"].map((emoji, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-3xl pointer-events-none"
                    style={{ left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 0.6, 0], scale: [0, 1.2, 0.8], y: [0, -30, -60] }}
                    transition={{ delay: 1 + i * 0.2, duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
