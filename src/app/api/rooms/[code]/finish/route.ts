import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const room = await prisma.room.findUnique({
    where: { code },
    include: { votes: true, meals: true },
  });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  // Find winner
  const voteCounts = room.meals.map((meal) => ({
    meal,
    count: room.votes.filter((v) => v.mealId === meal.id).length,
  }));

  const maxCount = Math.max(...voteCounts.map((v) => v.count), 0);
  const winners = voteCounts.filter((v) => v.count === maxCount && v.count > 0);

  let winnerId: number | null = null;
  let winnerMeal = winners[0];

  if (winners.length === 1) {
    winnerId = winners[0].meal.id;
  } else if (winners.length > 1) {
    // Tie — pick random
    winnerMeal = winners[Math.floor(Math.random() * winners.length)];
    winnerId = winnerMeal.meal.id;
  }

  await prisma.room.update({
    where: { id: room.id },
    data: { status: "finished", winnerId },
  });

  // Record in win history
  if (winnerId && winnerMeal) {
    await prisma.winHistory.create({
      data: {
        mealId: winnerId,
        mealName: `${winnerMeal.meal.nameVi} (${winnerMeal.meal.nameEn})`,
        roomCode: code,
        voteCount: winnerMeal.count,
        total: room.votes.length,
      },
    });
  }

  const tiedMeals = winners.length > 1 ? winners.map((w) => w.meal) : null;

  broadcast(code, "room-finished", {
    winnerId,
    winnerMeal: winnerMeal?.meal,
    winnerVotes: winnerMeal?.count,
    totalVotes: room.votes.length,
    isTie: winners.length > 1,
    tiedMeals,
  });

  return NextResponse.json({
    winnerId,
    isTie: winners.length > 1,
    tiedMeals,
  });
}
