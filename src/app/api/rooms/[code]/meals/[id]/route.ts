import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string; id: string }> }
) {
  const { code, id } = await params;
  const { nameVi, nameEn } = await request.json();

  if (!nameVi?.trim() || !nameEn?.trim()) {
    return NextResponse.json(
      { error: "Both nameVi and nameEn are required" },
      { status: 400 }
    );
  }

  const meal = await prisma.meal.findFirst({
    where: { id: Number(id), room: { code } },
  });

  if (!meal) {
    return NextResponse.json({ error: "Meal not found" }, { status: 404 });
  }

  const updated = await prisma.meal.update({
    where: { id: Number(id) },
    data: { nameVi: nameVi.trim(), nameEn: nameEn.trim() },
  });

  broadcast(code, "meal-updated", updated);

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string; id: string }> }
) {
  const { code, id } = await params;

  const meal = await prisma.meal.findFirst({
    where: { id: Number(id), room: { code } },
  });

  if (!meal) {
    return NextResponse.json({ error: "Meal not found" }, { status: 404 });
  }

  await prisma.vote.deleteMany({ where: { mealId: Number(id) } });
  await prisma.meal.delete({ where: { id: Number(id) } });

  broadcast(code, "meal-deleted", { mealId: Number(id) });

  return NextResponse.json({ success: true });
}
