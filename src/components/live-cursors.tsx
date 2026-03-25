"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CursorData = {
  participantId: number;
  nickname: string;
  x: number;
  y: number;
  lastSeen: number;
};

const CURSOR_COLORS = ["#FF6B35", "#22D3EE", "#A78BFA", "#FB7185", "#34D399", "#FBBF24", "#60A5FA"];

export function LiveCursors({
  roomCode,
  participantId,
  participantNickname,
}: {
  roomCode: string;
  participantId: number | null;
  participantNickname: string;
}) {
  const [cursors, setCursors] = useState<CursorData[]>([]);
  const lastPos = useRef({ x: 0, y: 0 });
  const throttleRef = useRef(false);

  // Broadcast cursor position throttled
  useEffect(() => {
    if (!participantId) return;

    const handleMouseMove = (e: MouseEvent) => {
      lastPos.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      };
    };

    const interval = setInterval(() => {
      if (throttleRef.current) return;
      throttleRef.current = true;
      fetch(`/api/rooms/${roomCode}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          emoji: `cursor:${Math.round(lastPos.current.x)}:${Math.round(lastPos.current.y)}:${participantNickname}`,
        }),
      }).catch(() => {}).finally(() => { throttleRef.current = false; });
    }, 300);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, [roomCode, participantId, participantNickname]);

  // Handle incoming cursor data from SSE
  const handleCursorReaction = useCallback(
    (emoji: string, pid: number) => {
      if (!emoji.startsWith("cursor:") || pid === participantId) return;
      const parts = emoji.split(":");
      if (parts.length < 4) return;
      const x = parseFloat(parts[1]);
      const y = parseFloat(parts[2]);
      const nickname = parts[3];
      setCursors((prev) => {
        const existing = prev.filter((c) => c.participantId !== pid);
        return [...existing, { participantId: pid, nickname, x, y, lastSeen: Date.now() }];
      });
    },
    [participantId]
  );

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__handleCursorReaction = handleCursorReaction;
    return () => {
      delete (window as unknown as Record<string, unknown>).__handleCursorReaction;
    };
  }, [handleCursorReaction]);

  // Clean stale cursors every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        const filtered = prev.filter((c) => now - c.lastSeen < 5000);
        if (filtered.length === prev.length) return prev;
        return filtered;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      <AnimatePresence>
        {cursors.map((cursor, i) => (
          <motion.div
            key={cursor.participantId}
            className="absolute"
            initial={false}
            animate={{
              left: `${cursor.x}%`,
              top: `${cursor.y}%`,
            }}
            transition={{ duration: 0.2, ease: "linear" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill={CURSOR_COLORS[i % CURSOR_COLORS.length]}>
              <path d="M0 0L12 9L5 10L8 18L5 19L2 11L0 0Z" />
            </svg>
            <span
              className="absolute left-4 top-4 text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white whitespace-nowrap"
              style={{ backgroundColor: CURSOR_COLORS[i % CURSOR_COLORS.length] }}
            >
              {cursor.nickname}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
