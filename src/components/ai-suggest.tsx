"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

type Suggestion = {
  nameVi: string;
  nameEn: string;
  description: string;
  tags: string;
  emoji: string;
  imageKeyword?: string;
};

const AI_THINKING_MESSAGES = [
  "Consulting the AI chef... 🤖",
  "Scanning Vietnamese cuisine... 🍜",
  "Analyzing your taste buds... 👅",
  "Asking grandma for recipes... 👵",
];

export function AiSuggest({
  roomCode,
  mood,
  currentMeals,
  onAddMeal,
}: {
  roomCode: string;
  mood: string | null;
  currentMeals: string[];
  onAddMeal: (meal: { nameVi: string; nameEn: string; description: string; tags: string }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [thinkingMsg, setThinkingMsg] = useState(AI_THINKING_MESSAGES[0]);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  async function handleSuggest() {
    setLoading(true);
    setShowPanel(true);
    setSuggestions([]);
    setAddedIds(new Set());

    const msgInterval = setInterval(() => {
      setThinkingMsg(AI_THINKING_MESSAGES[Math.floor(Math.random() * AI_THINKING_MESSAGES.length)]);
    }, 1200);

    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, mood, currentMeals }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch {
      // silently fail
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  }

  function handleAdd(suggestion: Suggestion, index: number) {
    onAddMeal({
      nameVi: suggestion.nameVi,
      nameEn: suggestion.nameEn,
      description: suggestion.description,
      tags: suggestion.tags,
    });
    setAddedIds((prev) => new Set(prev).add(index));
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSuggest}
        disabled={loading}
        size="sm"
        className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white text-xs"
      >
        {loading ? "🤖 Thinking..." : "✨ AI Suggest Meals"}
      </Button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {loading ? (
              <Card className="p-3 text-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-3xl mb-2 inline-block"
                >
                  🤖
                </motion.div>
                <motion.p
                  key={thinkingMsg}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground"
                >
                  {thinkingMsg}
                </motion.p>
              </Card>
            ) : (
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <Card className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl shrink-0">{s.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{s.nameVi}</p>
                          <p className="text-xs text-muted-foreground">{s.nameEn}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={addedIds.has(i) ? "secondary" : "default"}
                          className={`text-xs shrink-0 ${addedIds.has(i) ? "" : "bg-violet-500 hover:bg-violet-600"}`}
                          onClick={() => handleAdd(s, i)}
                          disabled={addedIds.has(i)}
                        >
                          {addedIds.has(i) ? "Added ✓" : "+ Add"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {s.tags.split(",").map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => setShowPanel(false)}
                >
                  Close suggestions
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
