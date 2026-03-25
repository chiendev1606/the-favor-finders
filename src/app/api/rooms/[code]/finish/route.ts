import { NextResponse } from "next/server";
import { finishRoom } from "@/lib/finish-room";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const result = await finishRoom(code);
  if (!result) {
    return NextResponse.json({ error: "Room not found or already finished" }, { status: 404 });
  }

  return NextResponse.json(result);
}
