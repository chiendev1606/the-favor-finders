import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const history = await prisma.winHistory.findMany({
    orderBy: { wonAt: "desc" },
    take: 50,
  });

  // Aggregate: meal name → win count
  const leaderboard: Record<string, { name: string; wins: number; lastWon: string }> = {};
  for (const h of history) {
    if (!leaderboard[h.mealName]) {
      leaderboard[h.mealName] = { name: h.mealName, wins: 0, lastWon: h.wonAt.toISOString() };
    }
    leaderboard[h.mealName].wins++;
  }

  const sorted = Object.values(leaderboard).sort((a, b) => b.wins - a.wins);

  // Meal of the Week: most wins in the last 7 days
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const weekHistory = history.filter((h) => new Date(h.wonAt) >= weekAgo);
  const weekCounts: Record<string, { name: string; wins: number }> = {};
  for (const h of weekHistory) {
    if (!weekCounts[h.mealName]) {
      weekCounts[h.mealName] = { name: h.mealName, wins: 0 };
    }
    weekCounts[h.mealName].wins++;
  }
  const mealOfTheWeek = Object.values(weekCounts).sort((a, b) => b.wins - a.wins)[0] || null;

  return NextResponse.json({ history, leaderboard: sorted, mealOfTheWeek });
}
