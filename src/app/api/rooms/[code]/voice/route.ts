import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { mealId, voiceUrl } = await request.json();

  const meal = await prisma.meal.update({
    where: { id: mealId },
    data: { voiceNote: voiceUrl },
  });

  broadcast(code, "voice-note", meal);

  return NextResponse.json(meal);
}
