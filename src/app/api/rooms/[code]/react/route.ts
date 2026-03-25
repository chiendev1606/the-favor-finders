import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { participantId, emoji } = await request.json();

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const reaction = await prisma.reaction.create({
    data: { roomId: room.id, participantId, emoji },
    include: { participant: true },
  });

  broadcast(code, "reaction", reaction);

  return NextResponse.json(reaction);
}
