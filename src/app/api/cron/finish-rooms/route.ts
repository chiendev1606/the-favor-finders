import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { finishRoom } from "@/lib/finish-room";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  // Vercel auto-sets CRON_SECRET for cron jobs
  if (process.env.CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Find all rooms with expired deadlines that are still voting
  const expiredRooms = await prisma.room.findMany({
    where: {
      status: "voting",
      deadline: { not: null, lte: new Date() },
    },
  });

  const results = [];
  for (const room of expiredRooms) {
    const result = await finishRoom(room.code);
    results.push({ code: room.code, finished: !!result });
  }

  return NextResponse.json({
    checked: new Date().toISOString(),
    expired: expiredRooms.length,
    results,
  });
}
