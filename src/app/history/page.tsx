"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

type LeaderboardEntry = { name: string; wins: number; lastWon: string };
type HistoryEntry = { id: number; mealName: string; roomCode: string; voteCount: number; total: number; wonAt: string };
type MealOfTheWeek = { name: string; wins: number } | null;

export default function HistoryPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mealOfTheWeek, setMealOfTheWeek] = useState<MealOfTheWeek>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard);
        setHistory(data.history);
        setMealOfTheWeek(data.mealOfTheWeek);
      });
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Hall of Fame 🏆</h1>
        <Link href="/">
          <Button variant="outline" size="sm">← Back</Button>
        </Link>
      </div>

      {/* Meal of the Week */}
      {mealOfTheWeek && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6 border-orange-300 dark:border-orange-700 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/20">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  👑
                </motion.span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">Meal of the Week</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{mealOfTheWeek.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Won {mealOfTheWeek.wins} time{mealOfTheWeek.wins !== 1 ? "s" : ""} this week
                  </p>
                </div>
                <motion.span
                  className="text-3xl"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🍜
                </motion.span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Leaderboard */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">All-Time Champions</CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-muted-foreground text-sm">No wins recorded yet. Start voting!</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, i) => (
                <motion.div
                  key={entry.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-2xl w-8 text-center">
                    {i < 3 ? medals[i] : `#${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate block">{entry.name}</span>
                  </div>
                  <Badge variant={i === 0 ? "default" : "secondary"} className={i === 0 ? "bg-orange-500" : ""}>
                    {entry.wins} win{entry.wins !== 1 ? "s" : ""}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Votes</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">No history yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{h.mealName}</span>
                    <span className="text-muted-foreground ml-2">
                      ({h.voteCount}/{h.total} votes)
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs shrink-0 ml-2">
                    {new Date(h.wonAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
