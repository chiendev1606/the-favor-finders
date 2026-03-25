import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { participantId, mealId, reason } = await request.json();

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  // Check if participant already used their veto
  const existing = await prisma.veto.findUnique({
    where: { roomId_participantId: { roomId: room.id, participantId } },
  });
  if (existing) return NextResponse.json({ error: "You already used your veto" }, { status: 400 });

  const veto = await prisma.veto.create({
    data: { roomId: room.id, participantId, mealId, reason },
    include: { participant: true, meal: true },
  });

  broadcast(code, "veto", veto);

  return NextResponse.json(veto);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const vetoes = await prisma.veto.findMany({
    where: { roomId: room.id },
    include: { participant: true, meal: true },
  });
  return NextResponse.json(vetoes);
}
