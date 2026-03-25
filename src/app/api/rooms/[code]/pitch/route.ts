import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { participantId, mealId, pitch } = await request.json();

  if (!pitch?.trim()) {
    return NextResponse.json({ error: "Pitch text is required" }, { status: 400 });
  }

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const participant = await prisma.participant.findFirst({
    where: { id: participantId, roomId: room.id },
  });
  if (!participant) return NextResponse.json({ error: "Participant not found" }, { status: 400 });

  const meal = await prisma.meal.findFirst({
    where: { id: mealId, roomId: room.id },
  });
  if (!meal) return NextResponse.json({ error: "Meal not found" }, { status: 400 });

  const pitchData = {
    participantId,
    nickname: participant.nickname,
    mealId,
    mealName: meal.nameVi,
    pitch: pitch.trim(),
    timestamp: new Date().toISOString(),
  };

  broadcast(code, "pitch", pitchData);

  return NextResponse.json(pitchData);
}
