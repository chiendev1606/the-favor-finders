"use client";

import Image from "next/image";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null };

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
    <div className="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 shrink-0">
        Pick Your Meal
      </h2>
      <div className="grid gap-2 flex-1 overflow-y-auto content-start">
        {meals.map((meal) => (
          <button
            key={meal.id}
            onClick={() => handleVote(meal.id)}
            className={`flex items-center gap-2 md:gap-3 text-left px-3 py-2 md:px-4 md:py-3 rounded-lg border-2 transition-all cursor-pointer ${
              currentVoteMealId === meal.id
                ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                : "border-gray-100 hover:border-orange-200 hover:bg-orange-50"
            }`}
          >
            {meal.image && (
              <Image src={meal.image} alt={meal.nameVi} width={40} height={40} className="w-8 h-8 md:w-10 md:h-10 object-cover rounded shrink-0" />
            )}
            <div className="min-w-0">
              <span className="font-medium text-gray-800 text-sm md:text-base">{meal.nameVi}</span>
              <span className="text-gray-400 ml-1 md:ml-2 text-xs md:text-sm">({meal.nameEn})</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
