import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { nickname } = await request.json();

  if (!nickname || typeof nickname !== "string" || !nickname.trim()) {
    return NextResponse.json({ error: "Nickname is required" }, { status: 400 });
  }

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const participant = await prisma.participant.create({
    data: { roomId: room.id, nickname: nickname.trim() },
  });

  broadcast(code, "participant-joined", participant);

  return NextResponse.json({ participantId: participant.id });
}
