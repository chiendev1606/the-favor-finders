"use client";

import { MealItem } from "./meal-item";
import { AddMealForm } from "./add-meal-form";

type Meal = { id: number; nameVi: string; nameEn: string };

export function MealList({
  meals,
  roomCode,
}: {
  meals: Meal[];
  roomCode: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Menu</h2>
      <div className="space-y-2">
        {meals.map((meal) => (
          <MealItem key={meal.id} meal={meal} roomCode={roomCode} />
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <AddMealForm roomCode={roomCode} />
      </div>
    </div>
  );
}
