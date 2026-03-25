"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null; description: string | null; tags: string | null; lat: number | null; lng: number | null };
type Vote = { participantId: number; mealId: number };
type Participant = { id: number; nickname: string };

export function ResultsChart({
  meals,
  votes,
  participants,
}: {
  meals: Meal[];
  votes: Vote[];
  participants: Participant[];
}) {
  const totalVotes = votes.length;

  const voteCounts = meals.map((meal) => ({
    meal,
    count: votes.filter((v) => v.mealId === meal.id).length,
    voters: votes
      .filter((v) => v.mealId === meal.id)
      .map((v) => participants.find((p) => p.id === v.participantId)?.nickname)
      .filter(Boolean),
  }));

  const sorted = [...voteCounts].sort((a, b) => b.count - a.count);
  const maxCount = sorted[0]?.count || 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Results</CardTitle>
        {totalVotes > 0 && (
          <Badge variant="secondary">
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-0">
        {totalVotes === 0 ? (
          <p className="text-muted-foreground text-sm">No votes yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {sorted.map(({ meal, count, voters }) => {
              const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
              const isWinner = count === maxCount && count > 0;

              return (
                <div key={meal.id} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {meal.image && (
                      <Image src={meal.image} alt={meal.nameVi} width={24} height={24} className="w-6 h-6 object-cover rounded shrink-0" />
                    )}
                    <span className={`text-sm font-medium flex-1 truncate ${isWinner ? "text-orange-600" : ""}`}>
                      {meal.nameVi}{" "}
                      <span className="text-muted-foreground font-normal">({meal.nameEn})</span>
                    </span>
                    <span className="text-sm font-semibold shrink-0">{count}</span>
                    {isWinner && (
                      <Badge className="bg-orange-500 hover:bg-orange-500 shrink-0 text-xs">Winner</Badge>
                    )}
                  </div>
                  <Progress
                    value={percentage}
                    className="h-3"
                  />
                  {voters.length > 0 && (
                    <p className="text-xs text-muted-foreground">{voters.join(", ")}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
