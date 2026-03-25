"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null; description: string | null; tags: string | null; lat: number | null; lng: number | null };

const COLORS = ["#FF6B35", "#F7C948", "#22D3EE", "#A78BFA", "#FB7185", "#34D399", "#60A5FA", "#FBBF24"];

export function SpinWheel({
  meals,
  show,
  onResult,
  onClose,
}: {
  meals: Meal[];
  show: boolean;
  onResult: (meal: Meal) => void;
  onClose: () => void;
}) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Meal | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!show || meals.length === 0) return null;

  const segAngle = 360 / meals.length;

  function handleSpin() {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);

    // Random 3-5 full rotations + random stop
    const winnerIndex = Math.floor(Math.random() * meals.length);
    const extraRotation = 1080 + Math.random() * 720;
    const stopAngle = extraRotation + (360 - winnerIndex * segAngle - segAngle / 2);

    setRotation((prev) => prev + stopAngle);

    // Play tick sound
    try {
      audioRef.current = new Audio("data:audio/wav;base64,UklGRl9vT19teleXAQBGTVQgBAAAAAEAAQARIwAAESMAABAACAABAAEAZGF0YQAAAA==");
      audioRef.current.volume = 0.3;
    } catch { /* no audio */ }

    setTimeout(() => {
      setSpinning(false);
      setWinner(meals[winnerIndex]);
      onResult(meals[winnerIndex]);
    }, 4000);
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
        <h2 className="text-xl font-bold text-orange-600 mb-4">
          {winner ? `${winner.nameVi} wins!` : "Spin the Wheel!"}
        </h2>

        {/* Wheel */}
        <div className="relative w-64 h-64 mx-auto mb-6">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-2xl">
            ▼
          </div>

          <motion.svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
          >
            {meals.map((meal, i) => {
              const startAngle = (i * segAngle * Math.PI) / 180;
              const endAngle = ((i + 1) * segAngle * Math.PI) / 180;
              const midAngle = (startAngle + endAngle) / 2;
              const x1 = 100 + 95 * Math.cos(startAngle);
              const y1 = 100 + 95 * Math.sin(startAngle);
              const x2 = 100 + 95 * Math.cos(endAngle);
              const y2 = 100 + 95 * Math.sin(endAngle);
              const largeArc = segAngle > 180 ? 1 : 0;
              const textX = 100 + 60 * Math.cos(midAngle);
              const textY = 100 + 60 * Math.sin(midAngle);
              const textAngle = (midAngle * 180) / Math.PI;

              return (
                <g key={meal.id}>
                  <path
                    d={`M100,100 L${x1},${y1} A95,95 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={COLORS[i % COLORS.length]}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                  >
                    {meal.nameVi.length > 10 ? meal.nameVi.slice(0, 9) + "…" : meal.nameVi}
                  </text>
                </g>
              );
            })}
          </motion.svg>
        </div>

        <div className="flex gap-3 justify-center">
          {!winner && (
            <Button
              onClick={handleSpin}
              disabled={spinning}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {spinning ? "Spinning..." : "Spin!"}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            {winner ? "Done" : "Cancel"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
