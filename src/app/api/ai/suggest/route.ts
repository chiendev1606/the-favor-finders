import { NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { roomCode, mood, currentMeals } = await request.json();

  // Get past winners for context
  const pastWins = await prisma.winHistory.findMany({
    orderBy: { wonAt: "desc" },
    take: 10,
  });
  const pastWinNames = pastWins.map((w) => w.mealName).join(", ");
  const existingMeals = (currentMeals as string[]).join(", ");

  const prompt = `You are a fun Vietnamese food expert helping a group pick meals to eat together.

Context:
- Current mood: ${mood || "not specified"}
- Meals already in the list: ${existingMeals || "none"}
- Recent past winners: ${pastWinNames || "none yet"}

Suggest 3 Vietnamese dishes that are NOT already in the list. For each dish, provide:
1. Vietnamese name
2. English name
3. A rich description (2-3 sentences) covering: where it originates from, what it tastes like, the key flavors and textures, and what makes it special
4. Tags from: soup, meat, seafood, vegetarian, spicy, grilled, steamed, light, budget, classic
5. A fun emoji that represents the dish
6. An image search keyword (in English) to find a photo of this dish

Reply in this exact JSON format (no markdown, no code blocks):
[{"nameVi":"...","nameEn":"...","description":"...","tags":"tag1,tag2","emoji":"🍜","imageKeyword":"..."}]`;

  try {
    const result = await askGemini(prompt);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse suggestions" }, { status: 500 });
    }
    const suggestions = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Gemini suggest error:", error);
    return NextResponse.json({ error: "AI suggestion failed" }, { status: 500 });
  }
}
