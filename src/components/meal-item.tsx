"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MealTags } from "@/components/tag-filter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null; description: string | null; tags: string | null; lat: number | null; lng: number | null };

export function MealItem({
  meal,
  roomCode,
  onEdit,
  onPreview,
}: {
  meal: Meal;
  roomCode: string;
  onEdit: () => void;
  onPreview?: () => void;
}) {
  async function handleDelete() {
    await fetch(`/api/rooms/${roomCode}/meals/${meal.id}`, {
      method: "DELETE",
    });
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full">
          <div
            className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent group text-left cursor-pointer"
            onClick={onPreview}
          >
            <div className="flex items-center gap-3 min-w-0">
              {meal.image ? (
                <Image src={meal.image} alt={meal.nameVi} width={40} height={40} className="w-10 h-10 object-cover rounded shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs shrink-0">
                  ?
                </div>
              )}
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{meal.nameVi}</div>
                <div className="text-muted-foreground text-xs truncate">{meal.nameEn}</div>
                <MealTags tags={meal.tags} />
              </div>
            </div>
            <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex gap-1 transition-opacity shrink-0 ml-2">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="h-7 px-2 text-xs">
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="h-7 px-2 text-xs text-destructive hover:text-destructive">
                Delete
              </Button>
            </div>
          </div>
        </TooltipTrigger>
        {meal.description && (
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-1.5">
              <p className="font-semibold text-sm">{meal.nameVi} — {meal.nameEn}</p>
              <p className="text-xs leading-relaxed">{meal.description}</p>
              <p className="text-[10px] text-muted-foreground">Click for full details & map</p>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
