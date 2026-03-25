"use client";

import { Badge } from "@/components/ui/badge";

const MOODS = [
  { emoji: "🥱", label: "Tired", tags: ["light", "soup"] },
  { emoji: "🔥", label: "Adventurous", tags: ["spicy", "grilled"] },
  { emoji: "💰", label: "Budget", tags: ["budget"] },
  { emoji: "🥗", label: "Healthy", tags: ["vegetarian", "light", "steamed"] },
  { emoji: "🍖", label: "Meat lover", tags: ["meat", "grilled"] },
  { emoji: "🦐", label: "Seafood", tags: ["seafood"] },
];

export function MoodPicker({
  roomCode,
  participantId,
  currentMood,
  onMoodSet,
}: {
  roomCode: string;
  participantId: number | null;
  currentMood: string | null;
  onMoodSet: (mood: string, tags: string[]) => void;
}) {
  async function handleMood(mood: string, tags: string[]) {
    if (!participantId) return;
    onMoodSet(mood, tags);
    fetch(`/api/rooms/${roomCode}/mood`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, mood }),
    }).catch(() => {});
  }

  return (
    <div className="flex flex-wrap gap-1 sm:gap-1.5">
      <span className="text-[11px] sm:text-xs text-muted-foreground self-center mr-0.5 sm:mr-1">Mood:</span>
      {MOODS.map((m) => (
        <Badge
          key={m.label}
          variant={currentMood === m.label ? "default" : "outline"}
          className={`cursor-pointer text-xs ${
            currentMood === m.label ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-accent"
          }`}
          onClick={() => handleMood(m.label, m.tags)}
        >
          {m.emoji} {m.label}
        </Badge>
      ))}
      {currentMood && (
        <Badge
          variant="outline"
          className="cursor-pointer text-xs text-muted-foreground"
          onClick={() => onMoodSet("", [])}
        >
          ✕ Clear
        </Badge>
      )}
    </div>
  );
}

export const MOOD_TAG_MAP: Record<string, string[]> = {
  Tired: ["light", "soup"],
  Adventurous: ["spicy", "grilled"],
  Budget: ["budget"],
  Healthy: ["vegetarian", "light", "steamed"],
  "Meat lover": ["meat", "grilled"],
  Seafood: ["seafood"],
};
