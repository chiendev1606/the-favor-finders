import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { participantId, text } = await request.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const message = await prisma.chatMessage.create({
    data: { roomId: room.id, participantId, text: text.trim() },
    include: { participant: true },
  });

  broadcast(code, "chat-message", message);

  return NextResponse.json(message);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const messages = await prisma.chatMessage.findMany({
    where: { roomId: room.id },
    include: { participant: true },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(messages);
}
