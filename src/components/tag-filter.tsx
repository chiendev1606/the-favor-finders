"use client";

import { Badge } from "@/components/ui/badge";

const TAG_ICONS: Record<string, string> = {
  spicy: "🌶️",
  vegetarian: "🥬",
  budget: "💰",
  soup: "🍜",
  meat: "🥩",
  seafood: "🦐",
  grilled: "🔥",
  steamed: "♨️",
  light: "🍃",
  classic: "⭐",
};

export function TagFilter({
  availableTags,
  selectedTags,
  onToggle,
}: {
  availableTags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 sm:gap-1.5">
      {availableTags.map((tag) => {
        const active = selectedTags.includes(tag);
        return (
          <Badge
            key={tag}
            variant={active ? "default" : "outline"}
            className={`cursor-pointer text-xs ${
              active ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-accent"
            }`}
            onClick={() => onToggle(tag)}
          >
            {TAG_ICONS[tag] || "🏷️"} {tag}
          </Badge>
        );
      })}
    </div>
  );
}

export function MealTags({ tags }: { tags: string | null }) {
  if (!tags) return null;
  const tagList = tags.split(",").filter(Boolean);
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tagList.map((tag) => (
        <span key={tag} className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
          {TAG_ICONS[tag.trim()] || "🏷️"} {tag.trim()}
        </span>
      ))}
    </div>
  );
}
