import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const room = await prisma.room.findUnique({
    where: { code },
    include: { meals: true },
  });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.meals.length === 0) return NextResponse.json({ error: "No meals" }, { status: 400 });

  const randomMeal = room.meals[Math.floor(Math.random() * room.meals.length)];

  broadcast(code, "random-pick", randomMeal);

  return NextResponse.json(randomMeal);
}
