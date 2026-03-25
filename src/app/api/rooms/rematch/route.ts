import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generateCode(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

export async function POST(request: Request) {
  const { fromRoomCode, nickname } = await request.json();

  if (!fromRoomCode || !nickname?.trim()) {
    return NextResponse.json({ error: "Room code and nickname required" }, { status: 400 });
  }

  // Get the old room's meals
  const oldRoom = await prisma.room.findUnique({
    where: { code: fromRoomCode },
    include: { meals: true },
  });

  if (!oldRoom) {
    return NextResponse.json({ error: "Original room not found" }, { status: 404 });
  }

  let code = generateCode();
  while (await prisma.room.findUnique({ where: { code } })) {
    code = generateCode();
  }

  // Create new room with same meals
  const room = await prisma.room.create({
    data: {
      code,
      meals: {
        create: oldRoom.meals.map((m) => ({
          nameVi: m.nameVi,
          nameEn: m.nameEn,
          image: m.image,
          description: m.description,
          tags: m.tags,
          lat: m.lat,
          lng: m.lng,
        })),
      },
      participants: { create: { nickname: nickname.trim() } },
    },
    include: { participants: true },
  });

  return NextResponse.json({
    code: room.code,
    participantId: room.participants[0].id,
  });
}
