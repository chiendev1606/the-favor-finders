"use client";

import { useState } from "react";
import { MealItem } from "./meal-item";
import { MealModal } from "./meal-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null; description: string | null; tags: string | null; lat: number | null; lng: number | null };

export function MealList({
  meals,
  roomCode,
  onPreview,
}: {
  meals: Meal[];
  roomCode: string;
  onPreview?: (meal: Meal) => void;
}) {
  const [modalMeal, setModalMeal] = useState<Meal | null | undefined>(undefined);

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Menu</CardTitle>
          <Button
            size="sm"
            onClick={() => setModalMeal(null)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            + Add
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pt-0">
          <div className="space-y-1">
            {meals.map((meal) => (
              <MealItem
                key={meal.id}
                meal={meal}
                roomCode={roomCode}
                onEdit={() => setModalMeal(meal)}
                onPreview={() => onPreview?.(meal)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

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
