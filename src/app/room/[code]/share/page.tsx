import type { Metadata } from "next";
import { ShareClient } from "./share-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;

  const title = `Join meal vote — Room ${code}`;
  const description = `Join "The Flavor Finders" and vote on what to eat! Room code: ${code}. Scan the QR code or click the link to join.`;

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

export default async function SharePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ShareClient code={code} />;
}
