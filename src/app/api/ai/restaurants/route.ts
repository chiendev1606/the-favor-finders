import { NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";

export async function POST(request: Request) {
  const { mealName, location } = await request.json();

  const locationContext = location
    ? `near ${location}`
    : "in Hanoi, Vietnam";

  const prompt = `You are a local food guide. A group just voted to eat "${mealName}" ${locationContext}.

Suggest 3 real restaurants or street food spots known for this dish. For each:
1. Restaurant name
2. Why it's good (1 fun sentence)
3. Price range (cheap/moderate/fancy)
4. A tip for ordering

Reply in this exact JSON format (no markdown, no code blocks):
[{"name":"...","why":"...","price":"cheap","tip":"..."}]`;

  try {
    const result = await askGemini(prompt);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse" }, { status: 500 });
    }
    const restaurants = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ restaurants });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("AI restaurant error:", message);
    return NextResponse.json({ error: `AI restaurant search failed: ${message}` }, { status: 500 });
  }
}
