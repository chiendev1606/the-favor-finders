"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REACTION_EMOJIS = ["❤️", "🔥", "😋", "🤤", "👍", "🎉", "💯", "🥰"];

type FloatingEmoji = { id: string; emoji: string; x: number };

export function FloatingReactions({
  roomCode,
  participantId,
}: {
  roomCode: string;
  participantId: number | null;
}) {
  const [floaters, setFloaters] = useState<FloatingEmoji[]>([]);

  const addFloater = useCallback((emoji: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = 10 + Math.random() * 80;
    const newFloater = { id, emoji, x };
    setFloaters((prev) => [...prev.slice(-15), newFloater]);
  }, []);

  // Remove floaters after animation
  useEffect(() => {
    if (floaters.length === 0) return;
    const timer = setTimeout(() => {
      setFloaters((prev) => prev.slice(1));
    }, 2500);
    return () => clearTimeout(timer);
  }, [floaters.length]);

  // Expose addFloater globally for SSE
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__addReactionFloater = addFloater;
    return () => {
      delete (window as unknown as Record<string, unknown>).__addReactionFloater;
    };
  }, [addFloater]);

  const sendReaction = useCallback(async (emoji: string) => {
    if (!participantId) return;
    addFloater(emoji);
    fetch(`/api/rooms/${roomCode}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, emoji }),
    }).catch(() => {});
  }, [participantId, roomCode, addFloater]);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {floaters.map((f) => (
            <motion.div
              key={f.id}
              className="absolute text-4xl"
              style={{ left: `${f.x}%`, bottom: "80px" }}
              initial={{ y: 0, opacity: 1, scale: 0.5 }}
              animate={{ y: -400, opacity: 0, scale: 1.3 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
            >
              {f.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-4 right-4 z-40 flex flex-wrap justify-end gap-0.5 sm:gap-1 bg-white/90 backdrop-blur rounded-full px-1.5 sm:px-2 py-1 shadow-lg border max-w-[200px] sm:max-w-none">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            className="text-lg sm:text-xl hover:scale-125 transition-transform cursor-pointer p-0.5 sm:p-1 min-w-[28px] min-h-[28px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}
