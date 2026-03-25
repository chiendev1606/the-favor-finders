import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const room = await prisma.room.findUnique({
    where: { code },
    include: {
      votes: { include: { meal: true, participant: true } },
      participants: true,
    },
  });

  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  // Build per-participant stats from all their historical votes
  const stats = await Promise.all(
    room.participants.map(async (p) => {
      // Get all votes by this nickname across all rooms
      const allVotes = await prisma.vote.findMany({
        where: { participant: { nickname: p.nickname } },
        include: { meal: true },
      });

      // Count meal preferences
      const mealCounts: Record<string, number> = {};
      for (const v of allVotes) {
        const name = v.meal.nameVi;
        mealCounts[name] = (mealCounts[name] || 0) + 1;
      }

      const sorted = Object.entries(mealCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      const favorite = sorted[0] || null;

      return {
        participantId: p.id,
        nickname: p.nickname,
        totalVotes: allVotes.length,
        favorite: favorite ? { name: favorite[0], count: favorite[1] } : null,
        topMeals: sorted.map(([name, count]) => ({ name, count })),
      };
    })
  );

  return NextResponse.json({ stats });
}
