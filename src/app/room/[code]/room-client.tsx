"use client";

import { useEffect, useState } from "react";
import { MealList } from "@/components/meal-list";
import { VotingSection } from "@/components/voting-section";
import { ResultsChart } from "@/components/results-chart";
import { NicknameModal } from "@/components/nickname-modal";

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
  image: string | null;
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
  const [needsNickname, setNeedsNickname] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`participant-${room.code}`);
    if (stored) {
      setParticipantId(Number(stored));
      setNeedsNickname(false);
    } else {
      setNeedsNickname(true);
    }
    setLoaded(true);
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

  if (!loaded) return null;

  return (
    <>
      {needsNickname && (
        <NicknameModal
          roomCode={room.code}
          onJoined={(id) => {
            setParticipantId(id);
            setNeedsNickname(false);
          }}
        />
      )}

      <div className="h-screen flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-orange-100 bg-white shrink-0">
          <h1 className="text-lg md:text-xl font-bold text-orange-600">
            The Flavor Finders
          </h1>
          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
            <span className="text-gray-500">
              Room:{" "}
              <span className="font-mono font-bold tracking-widest text-gray-700">
                {room.code}
              </span>
            </span>
            <span className="text-gray-400">
              {room.participants.length} joined
            </span>
          </div>
        </header>

        {/* Desktop: 3 columns | Mobile: vertical scroll */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 p-3 md:p-4 min-h-0 overflow-y-auto md:overflow-hidden">
          <div className="md:overflow-y-auto">
            <MealList meals={room.meals} roomCode={room.code} />
          </div>

          <div className="md:overflow-y-auto">
            <VotingSection
              meals={room.meals}
              roomCode={room.code}
              participantId={participantId}
              currentVoteMealId={myVote?.mealId ?? null}
            />
          </div>

          <div className="md:overflow-y-auto">
            <ResultsChart
              meals={room.meals}
              votes={room.votes}
              participants={room.participants}
            />
          </div>
        </div>
      </div>
    </>
  );
}
