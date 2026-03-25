"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null; description: string | null; tags: string | null; lat: number | null; lng: number | null };

export function VotingSection({
  meals,
  roomCode,
  participantId,
  currentVoteMealId,
}: {
  meals: Meal[];
  roomCode: string;
  participantId: number | null;
  currentVoteMealId: number | null;
}) {
  async function handleVote(mealId: number) {
    if (!participantId) return;

    await fetch(`/api/rooms/${roomCode}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, mealId }),
    });
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Pick Your Meal</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-0">
        <TooltipProvider>
          <div className="grid gap-2 content-start">
            {meals.map((meal) => {
              const isSelected = currentVoteMealId === meal.id;
              return (
                <Tooltip key={meal.id}>
                  <TooltipTrigger className="w-full">
                    <button
                      onClick={() => handleVote(meal.id)}
                      className={`w-full flex items-center gap-2 md:gap-3 text-left px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                          : "border-border hover:border-orange-200 hover:bg-accent"
                      }`}
                    >
                      {meal.image && (
                        <Image src={meal.image} alt={meal.nameVi} width={40} height={40} className="w-8 h-8 md:w-10 md:h-10 object-cover rounded shrink-0" />
                      )}
                      <div className="min-w-0 flex-1 text-left">
                        <span className="font-medium text-sm">{meal.nameVi}</span>
                        <span className="text-muted-foreground ml-1 text-xs">({meal.nameEn})</span>
                      </div>
                      {isSelected && (
                        <Badge className="bg-orange-500 hover:bg-orange-500 shrink-0">Voted</Badge>
                      )}
                    </button>
                  </TooltipTrigger>
                  {meal.description && (
                    <TooltipContent side="top" className="max-w-[280px] sm:max-w-xs">
                      <div className="space-y-1.5">
                        {meal.image && (
                          <Image src={meal.image} alt={meal.nameVi} width={200} height={120} className="w-full h-24 object-cover rounded-md" />
                        )}
                        <p className="font-semibold text-sm">{meal.nameVi}</p>
                        <p className="text-xs leading-relaxed">{meal.description}</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
