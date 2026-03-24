import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { nameVi, nameEn } = await request.json();

  if (!nameVi?.trim() || !nameEn?.trim()) {
    return NextResponse.json(
      { error: "Both nameVi and nameEn are required" },
      { status: 400 }
    );
  }

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const meal = await prisma.meal.create({
    data: { roomId: room.id, nameVi: nameVi.trim(), nameEn: nameEn.trim() },
  });

  broadcast(code, "meal-added", meal);

  return NextResponse.json(meal);
}
