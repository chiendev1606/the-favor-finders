import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { participantId, mealId } = await request.json();

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (room.status === "finished") {
    return NextResponse.json({ error: "Voting has ended" }, { status: 403 });
  }

  const meal = await prisma.meal.findFirst({
    where: { id: mealId, roomId: room.id },
  });
  if (!meal) {
    return NextResponse.json({ error: "Meal not found in this room" }, { status: 400 });
  }

  const participant = await prisma.participant.findFirst({
    where: { id: participantId, roomId: room.id },
  });
  if (!participant) {
    return NextResponse.json({ error: "Participant not found in this room" }, { status: 400 });
  }

  await prisma.vote.upsert({
    where: { roomId_participantId: { roomId: room.id, participantId } },
    update: { mealId },
    create: { roomId: room.id, participantId, mealId },
  });

  const votes = await prisma.vote.findMany({ where: { roomId: room.id } });

  broadcast(code, "vote-update", votes);

  return NextResponse.json({ success: true });
}
