import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { finishRoom } from "@/lib/finish-room";
import { RoomClient } from "./room-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;

  const title = `Join meal vote — Room ${code}`;
  const description = `Join "The Flavor Finders" and vote on what to eat! Room code: ${code}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "The Flavor Finders",
      images: [
        {
          url: `/api/og?code=${code}`,
          width: 1200,
          height: 630,
          alt: `The Flavor Finders — Room ${code}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?code=${code}`],
    },
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Check if room has an expired deadline — finish it on page load
  const roomCheck = await prisma.room.findUnique({ where: { code } });
  if (!roomCheck) notFound();

  if (
    roomCheck.status === "voting" &&
    roomCheck.deadline &&
    new Date(roomCheck.deadline).getTime() <= Date.now()
  ) {
    await finishRoom(code);
  }

  // Re-fetch with full includes after potential finish
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
