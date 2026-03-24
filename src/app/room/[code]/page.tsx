import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RoomClient } from "./room-client";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const room = await prisma.room.findUnique({
    where: { code },
    include: {
      meals: { orderBy: { createdAt: "asc" } },
      participants: { orderBy: { joinedAt: "asc" } },
      votes: true,
    },
  });

  if (!room) notFound();

  return <RoomClient initialRoom={room} />;
}
