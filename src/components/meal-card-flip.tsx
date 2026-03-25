"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null; description: string | null };

export function MealCardFlip({ meal }: { meal: Meal }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative w-full h-32 cursor-pointer perspective-[1000px]"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {meal.image ? (
            <Image src={meal.image} alt={meal.nameVi} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-4xl">🍜</div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-white font-bold text-sm">{meal.nameVi}</p>
            <p className="text-white/70 text-xs">{meal.nameEn}</p>
          </div>
          <div className="absolute top-2 right-2 bg-white/80 rounded-full px-2 py-0.5 text-[10px] text-gray-600">
            Tap to flip
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-lg bg-orange-50 p-4 flex flex-col justify-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="font-bold text-orange-600 text-sm mb-2">{meal.nameVi}</p>
          <p className="text-gray-600 text-xs leading-relaxed">
            {meal.description || "No description available."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
