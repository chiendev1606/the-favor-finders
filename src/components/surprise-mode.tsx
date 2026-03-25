"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null; description: string | null; tags: string | null; lat: number | null; lng: number | null };

export function SurpriseMode({
  meals,
  roomCode,
  participantId,
  currentVoteMealId,
  onVote,
}: {
  meals: Meal[];
  roomCode: string;
  participantId: number | null;
  currentVoteMealId: number | null;
  onVote: (mealId: number) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  async function handleVote(mealId: number) {
    if (!participantId) return;
    onVote(mealId);
    await fetch(`/api/rooms/${roomCode}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, mealId }),
    });
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">🎭 Surprise Vote</CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={() => setRevealed(!revealed)}
        >
          {revealed ? "Hide names" : "Reveal all"}
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 sm:gap-2">
          {meals.map((meal, i) => (
            <motion.button
              key={meal.id}
              onClick={() => handleVote(meal.id)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                currentVoteMealId === meal.id
                  ? "border-orange-500 ring-2 ring-orange-200"
                  : "border-transparent hover:border-orange-200"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {meal.image ? (
                <Image src={meal.image} alt={revealed ? meal.nameVi : `Mystery dish #${i + 1}`} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-4xl">
                  {revealed ? "🍜" : "❓"}
                </div>
              )}

              {/* Blur overlay when not revealed */}
              {!revealed && meal.image && (
                <div className="absolute inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center">
                  <span className="text-white text-3xl">❓</span>
                </div>
              )}

              {/* Name overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5">
                <p className="text-white text-xs font-medium text-center">
                  {revealed ? meal.nameVi : `Dish #${i + 1}`}
                </p>
              </div>

              {currentVoteMealId === meal.id && (
                <Badge className="absolute top-1 right-1 bg-orange-500 text-[10px]">✓</Badge>
              )}
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
