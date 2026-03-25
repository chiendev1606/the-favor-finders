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

  return NextResponse.json({ history, leaderboard: sorted });
}
