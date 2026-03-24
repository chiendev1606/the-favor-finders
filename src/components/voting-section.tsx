"use client";

type Meal = { id: number; nameVi: string; nameEn: string };

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
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Pick Your Meal
      </h2>
      <div className="grid gap-2">
        {meals.map((meal) => (
          <button
            key={meal.id}
            onClick={() => handleVote(meal.id)}
            className={`text-left px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
              currentVoteMealId === meal.id
                ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                : "border-gray-100 hover:border-orange-200 hover:bg-orange-50"
            }`}
          >
            <span className="font-medium text-gray-800">{meal.nameVi}</span>
            <span className="text-gray-400 ml-2 text-sm">({meal.nameEn})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
