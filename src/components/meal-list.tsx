"use client";

import { useState } from "react";
import { MealItem } from "./meal-item";
import { MealModal } from "./meal-modal";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null };

export function MealList({
  meals,
  roomCode,
}: {
  meals: Meal[];
  roomCode: string;
}) {
  const [modalMeal, setModalMeal] = useState<Meal | null | undefined>(undefined);
  // undefined = closed, null = add new, Meal = edit

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Menu</h2>
          <button
            onClick={() => setModalMeal(null)}
            className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 cursor-pointer"
          >
            + Add
          </button>
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto">
          {meals.map((meal) => (
            <MealItem
              key={meal.id}
              meal={meal}
              roomCode={roomCode}
              onEdit={() => setModalMeal(meal)}
            />
          ))}
        </div>
      </div>

      {modalMeal !== undefined && (
        <MealModal
          roomCode={roomCode}
          meal={modalMeal}
          onClose={() => setModalMeal(undefined)}
        />
      )}
    </>
  );
}
