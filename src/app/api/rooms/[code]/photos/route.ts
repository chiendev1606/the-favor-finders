import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { participantId, mealId, url } = await request.json();

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const photo = await prisma.mealPhoto.create({
    data: { roomId: room.id, participantId, mealId, url },
    include: { participant: true },
  });

  broadcast(code, "photo-added", photo);

  return NextResponse.json(photo);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const photos = await prisma.mealPhoto.findMany({
    where: { roomId: room.id },
    include: { participant: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(photos);
}
