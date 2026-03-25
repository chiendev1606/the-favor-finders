import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { finishRoom } from "@/lib/finish-room";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Check for expired deadline on every room fetch
  const roomCheck = await prisma.room.findUnique({ where: { code } });
  if (!roomCheck) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (
    roomCheck.status === "voting" &&
    roomCheck.deadline &&
    new Date(roomCheck.deadline).getTime() <= Date.now()
  ) {
    await finishRoom(code);
  }

  const room = await prisma.room.findUnique({
    where: { code },
    include: {
      meals: { orderBy: { createdAt: "asc" } },
      participants: { orderBy: { joinedAt: "asc" } },
      votes: true,
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json(room);
}
