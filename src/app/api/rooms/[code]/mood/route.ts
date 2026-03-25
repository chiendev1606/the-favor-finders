import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { participantId, mood } = await request.json();

  const participant = await prisma.participant.update({
    where: { id: participantId },
    data: { mood },
  });

  broadcast(code, "mood-update", { participantId, mood });

  return NextResponse.json(participant);
}
