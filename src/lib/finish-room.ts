import { prisma } from "@/lib/prisma";
import { broadcast, clearRoomTimer } from "@/lib/sse";

type VoteSummaryItem = {
  meal: { id: number; nameVi: string; nameEn: string; image: string | null };
  count: number;
  percentage: number;
  voters: string[];
};

export async function finishRoom(code: string) {
  const room = await prisma.room.findUnique({
    where: { code },
    include: {
      votes: true,
      meals: true,
      participants: true,
    },
  });
  if (!room || room.status === "finished") return null;

  clearRoomTimer(code);

  // Build vote summary
  const voteCounts = room.meals.map((meal) => {
    const mealVotes = room.votes.filter((v) => v.mealId === meal.id);
    return {
      meal,
      count: mealVotes.length,
      voters: mealVotes
        .map((v) => room.participants.find((p) => p.id === v.participantId)?.nickname)
        .filter(Boolean) as string[],
    };
  });

  const totalVotes = room.votes.length;
  const maxCount = Math.max(...voteCounts.map((v) => v.count), 0);
  const winners = voteCounts.filter((v) => v.count === maxCount && v.count > 0);

  let winnerId: number | null = null;
  let winnerEntry = winners[0];

  if (winners.length === 1) {
    winnerId = winners[0].meal.id;
  } else if (winners.length > 1) {
    winnerEntry = winners[Math.floor(Math.random() * winners.length)];
    winnerId = winnerEntry.meal.id;
  }

  await prisma.room.update({
    where: { id: room.id },
    data: { status: "finished", winnerId, deadline: null },
  });

  // Record in win history
  if (winnerId && winnerEntry) {
    await prisma.winHistory.create({
      data: {
        mealId: winnerId,
        mealName: `${winnerEntry.meal.nameVi} (${winnerEntry.meal.nameEn})`,
        roomCode: code,
        voteCount: winnerEntry.count,
        total: totalVotes,
      },
    });
  }

  // Build sorted summary for broadcast
  const summary: VoteSummaryItem[] = [...voteCounts]
    .sort((a, b) => b.count - a.count)
    .map((v) => ({
      meal: {
        id: v.meal.id,
        nameVi: v.meal.nameVi,
        nameEn: v.meal.nameEn,
        image: v.meal.image,
      },
      count: v.count,
      percentage: totalVotes > 0 ? Math.round((v.count / totalVotes) * 100) : 0,
      voters: v.voters,
    }));

  const tiedMeals = winners.length > 1 ? winners.map((w) => w.meal) : null;

  const broadcastData = {
    winnerId,
    winnerMeal: winnerEntry?.meal ?? null,
    winnerVotes: winnerEntry?.count ?? 0,
    totalVotes,
    totalParticipants: room.participants.length,
    isTie: winners.length > 1,
    tiedMeals,
    summary,
    finishedAt: new Date().toISOString(),
  };

  broadcast(code, "room-finished", broadcastData);

  return {
    winnerId,
    isTie: winners.length > 1,
    tiedMeals,
    summary,
  };
}
