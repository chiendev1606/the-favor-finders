"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FOOD_EMOJIS = [
  "🍜", "🍲", "🥢", "🍛", "🥘", "🍝", "🥡", "🍚",
  "🫕", "🥣", "🍱", "🥟", "🍤", "🥩", "🌶️", "🧄",
  "🫚", "🥬", "🌿", "🍋", "🧅", "🥕", "🍖", "🦐",
];

const CONFETTI_COLORS = [
  "#FF6B35", "#F7C948", "#22D3EE", "#A78BFA",
  "#FB7185", "#34D399", "#60A5FA", "#FBBF24",
];

function FallingEmoji({ emoji, delay, x }: { emoji: string; delay: number; x: number }) {
  return (
    <motion.div
      className="absolute text-3xl md:text-4xl pointer-events-none select-none"
      initial={{ y: -80, x, opacity: 0, rotate: -30 }}
      animate={{
        y: ["0vh", "105vh"],
        opacity: [0, 1, 1, 0],
        rotate: [-30, 360],
      }}
      transition={{
        duration: 2 + Math.random() * 1.5,
        delay: delay * 0.5,
        ease: "easeIn",
      }}
      style={{ left: `${x}%` }}
    >
      {emoji}
    </motion.div>
  );
}

function ConfettiPiece({ color, delay, x }: { color: string; delay: number; x: number }) {
  const size = 6 + Math.random() * 8;
  const isCircle = Math.random() > 0.5;
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        width: size,
        height: isCircle ? size : size * 2.5,
        backgroundColor: color,
        borderRadius: isCircle ? "50%" : "2px",
      }}
      initial={{ y: -20, opacity: 0, rotate: 0, scale: 0 }}
      animate={{
        y: ["0vh", "110vh"],
        opacity: [0, 1, 1, 0.5, 0],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
        scale: [0, 1, 1, 0.8],
        x: [0, (Math.random() - 0.5) * 100],
      }}
      transition={{
        duration: 1.5 + Math.random() * 1,
        delay: delay * 0.4,
        ease: "easeIn",
      }}
    />
  );
}

function FloatingBowl({ delay, startX }: { delay: number; startX: number }) {
  return (
    <motion.div
      className="absolute text-6xl md:text-8xl pointer-events-none select-none"
      style={{ left: `${startX}%` }}
      initial={{ y: "50vh", opacity: 0, scale: 0 }}
      animate={{
        y: ["50vh", "30vh", "40vh", "25vh"],
        opacity: [0, 1, 1, 0],
        scale: [0, 1.3, 1, 1.2],
        rotate: [0, -10, 10, 0],
      }}
      transition={{
        duration: 1.8,
        delay: delay * 0.5,
        ease: "easeInOut",
      }}
    >
      🍜
    </motion.div>
  );
}

export function WelcomeAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2000);
    const t4 = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 400);
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  const emojis = Array.from({ length: 15 }, (_, i) => ({
    emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
    delay: 0.2 + Math.random() * 1.5,
    x: Math.random() * 95,
  }));

  const confetti = Array.from({ length: 25 }, (_, i) => ({
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: 1 + Math.random() * 1,
    x: Math.random() * 100,
  }));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)" }}
        >
          {/* Falling food emojis */}
          {emojis.map((e, i) => (
            <FallingEmoji key={`emoji-${i}`} {...e} />
          ))}

          {/* Confetti */}
          {confetti.map((c, i) => (
            <ConfettiPiece key={`confetti-${i}`} {...c} />
          ))}

          {/* Floating bowls */}
          <FloatingBowl delay={0.3} startX={10} />
          <FloatingBowl delay={0.8} startX={75} />
          <FloatingBowl delay={1.5} startX={40} />

          {/* Center content */}
          <div className="relative z-10 text-center px-6">
            {/* Big emoji entrance */}
            <motion.div
              className="text-5xl sm:text-7xl md:text-9xl mb-4 sm:mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.4, 1], rotate: [-180, 20, 0] }}
              transition={{ duration: 0.6, ease: "backOut" }}
            >
              🍜
            </motion.div>

            {/* Title */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-6xl font-bold text-orange-600 mb-3 sm:mb-4"
                  initial={{ y: 40, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "backOut" }}
                >
                  {"The Flavor Finders".split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * i, duration: 0.3 }}
                      className="inline-block"
                      style={{ display: char === " " ? "inline" : "inline-block" }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.h1>
              )}
            </AnimatePresence>

            {/* Subtitle */}
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="text-base sm:text-xl md:text-2xl text-orange-500 font-medium mb-2">
                    Hungry? Let&apos;s decide together!
                  </p>
                  <motion.p
                    className="text-lg text-orange-400"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: 3, duration: 0.8 }}
                  >
                    Vote on what to eat 🗳️
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fun food parade */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  className="mt-4 sm:mt-8 flex justify-center gap-2 sm:gap-3 text-3xl sm:text-4xl md:text-5xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {["🍜", "🥢", "🍲", "🥘", "🍛"].map((emoji, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: 50, opacity: 0, rotate: -20 }}
                      animate={{
                        y: [50, -15, 0],
                        opacity: 1,
                        rotate: [- 20, 10, 0],
                      }}
                      transition={{
                        delay: i * 0.15,
                        duration: 0.6,
                        ease: "backOut",
                      }}
                      className="inline-block"
                    >
                      <motion.span
                        className="inline-block"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                      >
                        {emoji}
                      </motion.span>
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading dots */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  className="mt-6 flex justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full bg-orange-400"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
