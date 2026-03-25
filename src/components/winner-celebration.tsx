"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null };

export function WinnerCelebration({
  show,
  meal,
  votes,
  total,
  onClose,
}: {
  show: boolean;
  meal: Meal | null;
  votes: number;
  total: number;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!show) return;
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [show]);

  return (
    <AnimatePresence>
      {show && meal && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-card rounded-2xl shadow-2xl max-w-sm w-full p-4 sm:p-6 md:p-8 text-center mx-2"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: 2 }}
            >
              🏆
            </motion.div>

            <h2 className="text-xl sm:text-2xl font-bold text-orange-600 mb-2">We have a winner!</h2>

            {meal.image && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="mx-auto w-32 h-32 rounded-xl overflow-hidden mb-4"
              >
                <Image src={meal.image} alt={meal.nameVi} width={128} height={128} className="w-full h-full object-cover" />
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{meal.nameVi}</h3>
              <p className="text-muted-foreground mb-3">{meal.nameEn}</p>
              <p className="text-orange-500 font-semibold text-lg">
                {votes} out of {total} votes
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6"
            >
              <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600">
                Nice! Let&apos;s eat!
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
