import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { minutes } = await request.json();

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const deadline = new Date(Date.now() + minutes * 60 * 1000);

  await prisma.room.update({
    where: { id: room.id },
    data: { deadline, status: "voting" },
  });

  broadcast(code, "deadline-set", { deadline: deadline.toISOString(), minutes });

  return NextResponse.json({ deadline });
}
