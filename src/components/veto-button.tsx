"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type VetoData = { participantId: number; mealId: number; participant: { nickname: string }; reason?: string };

export function VetoButton({
  roomCode,
  participantId,
  mealId,
  vetoes,
  hasUsedVeto,
}: {
  roomCode: string;
  participantId: number | null;
  mealId: number;
  vetoes: VetoData[];
  hasUsedVeto: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const mealVetoes = vetoes.filter((v) => v.mealId === mealId);
  const isVetoed = mealVetoes.length > 0;

  async function handleVeto() {
    if (!participantId || hasUsedVeto) return;
    setLoading(true);
    await fetch(`/api/rooms/${roomCode}/veto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, mealId, reason: "Can't eat this" }),
    });
    setLoading(false);
  }

  return (
    <TooltipProvider>
      <div className="inline-flex items-center gap-1">
        {isVetoed && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                🚫 Vetoed
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Vetoed by: {mealVetoes.map((v) => v.participant.nickname).join(", ")}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        {!isVetoed && !hasUsedVeto && participantId && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px] text-red-400 opacity-0 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); handleVeto(); }}
            disabled={loading}
          >
            🚫 Veto
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}
