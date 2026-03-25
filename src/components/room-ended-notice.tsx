"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export function RoomEndedNotice() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="w-full max-w-sm"
      >
        <Card className="p-6 sm:p-8 text-center space-y-4">
          {/* Sad food emoji */}
          <motion.div
            className="text-6xl sm:text-7xl"
            animate={{
              rotate: [0, -5, 5, -5, 0],
              y: [0, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            😅
          </motion.div>

          <motion.h2
            className="text-xl sm:text-2xl font-bold text-foreground"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Oops, too late!
          </motion.h2>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <p className="text-muted-foreground text-sm">
              This room already finished voting.
            </p>
            <p className="text-muted-foreground text-sm">
              The food has been chosen... without you! 🍜
            </p>
          </motion.div>

          {/* Fun food parade */}
          <motion.div
            className="flex justify-center gap-2 text-2xl py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {["🍜", "🚫", "😢", "🚫", "🥢"].map((emoji, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.15, ease: "easeInOut" }}
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-2 pt-2"
          >
            <Link href="/" className="block">
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                Create a New Room
              </Button>
            </Link>
            <Link href="/history" className="block">
              <Button variant="outline" className="w-full">
                🏆 See Hall of Fame
              </Button>
            </Link>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
