"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function TimesUpAnimation({ show, onComplete }: { show: boolean; onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!show) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => onComplete(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-gradient-to-br from-red-600/95 via-orange-600/95 to-yellow-500/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Alarm bell */}
          <motion.div
            className="text-7xl sm:text-8xl md:text-9xl mb-4"
            animate={{ rotate: [0, -15, 15, -15, 15, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            ⏰
          </motion.div>

          {/* TIME'S UP text */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-3 text-center px-4"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: [0, 1.2, 1], rotate: [-10, 5, 0] }}
            transition={{ delay: 0.3, type: "spring", damping: 10 }}
          >
            TIME&apos;S UP!
          </motion.h1>

          {/* Subtitle */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.p
                className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium text-center px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Counting the votes...
              </motion.p>
            )}
          </AnimatePresence>

          {/* Loading dots */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                className="flex gap-2 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating food emojis */}
          {["🍜", "🥢", "🍲", "🥘", "🍛", "🔔"].map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl sm:text-3xl pointer-events-none"
              style={{ left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.5, 0], scale: [0, 1.2, 0.8], y: [0, -20, -40] }}
              transition={{ delay: 0.5 + i * 0.3, duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
