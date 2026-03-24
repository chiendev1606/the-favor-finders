"use client";

type Meal = { id: number; nameVi: string; nameEn: string };
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
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Results
        {totalVotes > 0 && (
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({totalVotes} vote{totalVotes !== 1 ? "s" : ""})
          </span>
        )}
      </h2>

      {totalVotes === 0 ? (
        <p className="text-gray-400 text-sm">No votes yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {sorted.map(({ meal, count, voters }) => {
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            const isWinner = count === maxCount && count > 0;

            return (
              <div key={meal.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isWinner ? "text-orange-600" : "text-gray-700"
                    }`}
                  >
                    {meal.nameVi}{" "}
                    <span className="text-gray-400 font-normal">
                      ({meal.nameEn})
                    </span>
                    {isWinner && " — Winner!"}
                  </span>
                  <span className="text-sm text-gray-500">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWinner ? "bg-orange-500" : "bg-orange-200"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {voters.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {voters.join(", ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
