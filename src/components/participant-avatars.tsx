"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Participant = { id: number; nickname: string };

const COLORS = [
  "bg-orange-500",
  "bg-teal-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-red-500",
];

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function getColor(index: number) {
  return COLORS[index % COLORS.length];
}

export function ParticipantAvatars({
  participants,
  maxVisible = 5,
}: {
  participants: Participant[];
  maxVisible?: number;
}) {
  const visible = participants.slice(0, maxVisible);
  const overflow = participants.length - maxVisible;

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {visible.map((p, i) => (
          <Tooltip key={p.id}>
            <TooltipTrigger>
              <Avatar className={`w-8 h-8 border-2 border-white cursor-default ${getColor(i)}`}>
                <AvatarFallback className={`${getColor(i)} text-white text-xs font-medium`}>
                  {getInitials(p.nickname)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{p.nickname}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {overflow > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="w-8 h-8 border-2 border-white bg-muted cursor-default">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                  +{overflow}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{participants.slice(maxVisible).map(p => p.nickname).join(", ")}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
