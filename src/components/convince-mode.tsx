"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

type Meal = { id: number; nameVi: string; nameEn: string };
type Pitch = {
  participantId: number;
  nickname: string;
  mealId: number;
  mealName: string;
  pitch: string;
  timestamp: string;
};

const PITCH_LIMIT = 120; // characters

export function ConvinceMode({
  roomCode,
  participantId,
  meals,
  pitches,
  isFinished,
}: {
  roomCode: string;
  participantId: number | null;
  meals: Meal[];
  pitches: Pitch[];
  isFinished?: boolean;
}) {
  const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [pitching, setPitching] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 30-second countdown when pitching
  useEffect(() => {
    if (!pitching) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [pitching, timeLeft]);

  const handleStart = (mealId: number) => {
    setSelectedMeal(mealId);
    setPitching(true);
    setTimeLeft(30);
    setText("");
  };

  const handleSubmit = useCallback(async () => {
    if (!participantId || !selectedMeal || submitted) return;
    setPitching(false);
    setSubmitted(true);

    if (text.trim()) {
      await fetch(`/api/rooms/${roomCode}/pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, mealId: selectedMeal, pitch: text.trim() }),
      });
    }
  }, [participantId, selectedMeal, text, roomCode, submitted]);

  const myPitch = pitches.find((p) => p.participantId === participantId);
  const hasPitched = !!myPitch || submitted;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          🎤 Convince Me!
          <Badge variant="outline" className="text-[10px]">30s pitch</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Pitch input */}
        {!hasPitched && !isFinished && (
          <div className="space-y-2">
            {!pitching ? (
              <>
                <p className="text-xs text-muted-foreground">Pick a meal and convince everyone why it&apos;s the best!</p>
                <div className="flex flex-wrap gap-1.5">
                  {meals.map((meal) => (
                    <Button
                      key={meal.id}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleStart(meal.id)}
                    >
                      {meal.nameVi}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">
                    Pitching: <span className="text-orange-600">{meals.find((m) => m.id === selectedMeal)?.nameVi}</span>
                  </p>
                  <Badge variant={timeLeft <= 10 ? "destructive" : "secondary"} className={`font-mono ${timeLeft <= 10 ? "animate-pulse" : ""}`}>
                    {timeLeft}s
                  </Badge>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, PITCH_LIMIT))}
                  placeholder="Why should we eat this? Go!"
                  className="w-full h-20 text-sm p-2 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{text.length}/{PITCH_LIMIT}</span>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-xs" onClick={handleSubmit}>
                    Submit Pitch 🎤
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Pitch bubbles */}
        {pitches.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence>
              {pitches.map((p, i) => (
                <motion.div
                  key={`${p.participantId}-${p.timestamp}`}
                  initial={{ opacity: 0, scale: 0.9, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="bg-accent/50 rounded-xl p-3 border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">{p.nickname}</Badge>
                      <span className="text-[10px] text-orange-600 font-medium">for {p.mealName}</span>
                    </div>
                    <p className="text-sm">&ldquo;{p.pitch}&rdquo;</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {pitches.length === 0 && hasPitched && (
          <p className="text-xs text-muted-foreground text-center">Your pitch is in! Waiting for others... 🎤</p>
        )}
      </CardContent>
    </Card>
  );
}
