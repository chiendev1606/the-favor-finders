import { NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";

export async function POST(request: Request) {
  const { winnerMeal, totalVotes, totalParticipants, summary } = await request.json();

  const resultsText = (summary as Array<{ meal: { nameVi: string; nameEn: string }; count: number; percentage: number; voters: string[] }>)
    .map((s, i) => `#${i + 1}: ${s.meal.nameVi} (${s.meal.nameEn}) — ${s.count} votes (${s.percentage}%) by ${s.voters.join(", ") || "nobody"}`)
    .join("\n");

  const prompt = `You are a funny Vietnamese food commentator. A group just finished voting on what to eat.

Results:
${resultsText}

Winner: ${winnerMeal}
Total: ${totalVotes} votes from ${totalParticipants} people

Write a short, funny commentary (2-3 sentences max) about the result. Be playful, use food puns if possible. Include 1-2 emojis. Keep it under 150 characters. No quotes around the text.`;

  try {
    const result = await askGemini(prompt);
    return NextResponse.json({ commentary: result.trim() });
  } catch (error) {
    console.error("Gemini commentary error:", error);
    return NextResponse.json({ commentary: "The people have spoken! 🍜" });
  }
}
