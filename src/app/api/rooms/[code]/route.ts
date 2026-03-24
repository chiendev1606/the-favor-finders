import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

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
