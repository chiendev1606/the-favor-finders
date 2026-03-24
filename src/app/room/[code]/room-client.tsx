"use client";

import { useEffect, useState } from "react";
import { MealList } from "@/components/meal-list";
import { VotingSection } from "@/components/voting-section";
import { ResultsChart } from "@/components/results-chart";

type Room = {
  id: number;
  code: string;
  meals: Meal[];
  participants: Participant[];
  votes: Vote[];
};

type Meal = {
  id: number;
  nameVi: string;
  nameEn: string;
};

type Participant = {
  id: number;
  nickname: string;
};

type Vote = {
  id: number;
  participantId: number;
  mealId: number;
};

export function RoomClient({ initialRoom }: { initialRoom: Room }) {
  const [room, setRoom] = useState(initialRoom);
  const [participantId, setParticipantId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`participant-${room.code}`);
    if (stored) setParticipantId(Number(stored));
  }, [room.code]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/rooms/${room.code}/events`);

    eventSource.addEventListener("vote-update", (e) => {
      const votes = JSON.parse(e.data);
      setRoom((prev) => ({ ...prev, votes }));
    });

    eventSource.addEventListener("meal-added", (e) => {
      const meal = JSON.parse(e.data);
      setRoom((prev) => ({
        ...prev,
        meals: [...prev.meals, meal],
      }));
    });

    eventSource.addEventListener("meal-updated", (e) => {
      const meal = JSON.parse(e.data);
      setRoom((prev) => ({
        ...prev,
        meals: prev.meals.map((m) => (m.id === meal.id ? meal : m)),
      }));
    });

    eventSource.addEventListener("meal-deleted", (e) => {
      const { mealId } = JSON.parse(e.data);
      setRoom((prev) => ({
        ...prev,
        meals: prev.meals.filter((m) => m.id !== mealId),
        votes: prev.votes.filter((v) => v.mealId !== mealId),
      }));
    });

    eventSource.addEventListener("participant-joined", (e) => {
      const participant = JSON.parse(e.data);
      setRoom((prev) => ({
        ...prev,
        participants: [...prev.participants, participant],
      }));
    });

    return () => eventSource.close();
  }, [room.code]);

  const myVote = room.votes.find((v) => v.participantId === participantId);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-orange-600">
          The Flavor Finders
        </h1>
        <p className="text-gray-500 mt-1">
          Room Code:{" "}
          <span className="font-mono font-bold tracking-widest text-gray-700">
            {room.code}
          </span>
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {room.participants.length} participant(s)
        </p>
      </div>

      <div className="space-y-6">
        <MealList meals={room.meals} roomCode={room.code} />

        <VotingSection
          meals={room.meals}
          roomCode={room.code}
          participantId={participantId}
          currentVoteMealId={myVote?.mealId ?? null}
        />

        <ResultsChart
          meals={room.meals}
          votes={room.votes}
          participants={room.participants}
        />
      </div>
    </main>
  );
}
