import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_MEALS } from "@/lib/default-meals";
import { scheduleRoomFinish } from "@/lib/sse";
import { finishRoom } from "@/lib/finish-room";
import crypto from "crypto";

function generateCode(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

export async function POST(request: Request) {
  const { nickname, deadlineUtc } = await request.json();

  if (!nickname || typeof nickname !== "string" || !nickname.trim()) {
    return NextResponse.json({ error: "Nickname is required" }, { status: 400 });
  }

  let code = generateCode();
  while (await prisma.room.findUnique({ where: { code } })) {
    code = generateCode();
  }

  const deadline = deadlineUtc ? new Date(deadlineUtc) : null;

  const room = await prisma.room.create({
    data: {
      code,
      deadline,
      meals: { create: DEFAULT_MEALS },
      participants: { create: { nickname: nickname.trim() } },
    },
    include: { participants: true },
  });

  // Schedule server-side auto-finish if deadline is set
  if (deadline) {
    scheduleRoomFinish(code, deadline, async () => { await finishRoom(code); });
  }

  return NextResponse.json({
    code: room.code,
    participantId: room.participants[0].id,
  });
}
