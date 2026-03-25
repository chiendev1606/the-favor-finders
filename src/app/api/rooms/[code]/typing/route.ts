import { NextResponse } from "next/server";
import { broadcast } from "@/lib/sse";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { participantId, nickname } = await request.json();

  broadcast(code, "typing", { participantId, nickname });

  return NextResponse.json({ ok: true });
}
