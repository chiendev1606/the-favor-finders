import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast, scheduleRoomFinish } from "@/lib/sse";
import { finishRoom } from "@/lib/finish-room";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { minutes } = await request.json();

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  // Server uses UTC — Date.now() is always UTC milliseconds
  const deadline = new Date(Date.now() + minutes * 60 * 1000);

  await prisma.room.update({
    where: { id: room.id },
    data: { deadline, status: "voting" },
  });

  // Schedule server-side auto-finish when deadline arrives
  scheduleRoomFinish(code, deadline, () => finishRoom(code));

  broadcast(code, "deadline-set", {
    deadline: deadline.toISOString(),
    minutes,
  });

  return NextResponse.json({ deadline: deadline.toISOString() });
}
