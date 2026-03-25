"use client";

import { useEffect, useState, useCallback } from "react";
import { MealList } from "@/components/meal-list";
import { VotingSection } from "@/components/voting-section";
import { ResultsChart } from "@/components/results-chart";
import { NicknameModal } from "@/components/nickname-modal";
import { ParticipantAvatars } from "@/components/participant-avatars";
import { WelcomeAnimation } from "@/components/welcome-animation";
import { CountdownTimer } from "@/components/countdown-timer";
import { WinnerCelebration } from "@/components/winner-celebration";
import { SpinWheel } from "@/components/spin-wheel";
import { FloatingReactions } from "@/components/floating-reactions";
import { MiniChat } from "@/components/mini-chat";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { LiveCursors } from "@/components/live-cursors";
import { RandomPicker } from "@/components/random-picker";
import { RestaurantMap } from "@/components/restaurant-map";
import { TagFilter } from "@/components/tag-filter";
import { MealPreviewModal } from "@/components/meal-preview-modal";
import { MoodPicker, MOOD_TAG_MAP } from "@/components/mood-picker";
import { SplitBill } from "@/components/split-bill";
import { PhotoWall } from "@/components/photo-wall";
import { StreakCounter } from "@/components/streak-counter";
import { SoundToggle, useSoundEffects } from "@/components/sound-effects";
import { SurpriseMode } from "@/components/surprise-mode";
import { VoteNudge } from "@/components/vote-nudge";
import { InviteCardGenerator } from "@/components/invite-card-generator";
import { AmbientMusic } from "@/components/ambient-music";
import { AVAILABLE_TAGS } from "@/lib/default-meals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Room = {
  id: number;
  code: string;
  status: string;
  deadline: string | Date | null;
  winnerId: number | null;
  meals: Meal[];
  participants: Participant[];
  votes: Vote[];
};

type Meal = {
  id: number;
  nameVi: string;
  nameEn: string;
  image: string | null;
  description: string | null;
  tags: string | null;
  lat: number | null;
  lng: number | null;
};

type Participant = { id: number; nickname: string };
type Vote = { id: number; participantId: number; mealId: number };
type ChatMsg = { id: number; text: string; participantId: number; participant: { nickname: string }; createdAt: string };
type VetoData = { participantId: number; mealId: number; participant: { nickname: string }; reason?: string };
type PhotoData = { id: number; url: string; participantId: number; participant: { nickname: string }; createdAt: string };
type VoteSummaryItem = {
  meal: { id: number; nameVi: string; nameEn: string; image: string | null };
  count: number;
  percentage: number;
  voters: string[];
};

export function RoomClient({ initialRoom }: { initialRoom: Room }) {
  const [room, setRoom] = useState(initialRoom);
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [nickname, setNickname] = useState("");
  const [needsNickname, setNeedsNickname] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Feature states
  const [showWinner, setShowWinner] = useState(false);
  const [winnerData, setWinnerData] = useState<{ meal: Meal | null; votes: number; total: number }>({ meal: null, votes: 0, total: 0 });
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [tiedMeals, setTiedMeals] = useState<Meal[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [mapMealName, setMapMealName] = useState("");
  const [previewMeal, setPreviewMeal] = useState<Meal | null>(null);

  // New feature states
  const [mood, setMood] = useState<string | null>(null);
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [vetoes, setVetoes] = useState<VetoData[]>([]);
  const [showBill, setShowBill] = useState(false);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [showPhotos, setShowPhotos] = useState(false);
  const [surpriseMode, setSurpriseMode] = useState(false);
  const [voteSummary, setVoteSummary] = useState<VoteSummaryItem[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const { play: playSound, enabled: soundEnabled, toggle: toggleSound } = useSoundEffects();

  useEffect(() => {
    const seen = sessionStorage.getItem("flavor-finders-welcomed");
    if (!seen) setShowAnimation(true);

    const stored = localStorage.getItem(`participant-${room.code}`);
    if (stored) {
      setParticipantId(Number(stored));
      setNeedsNickname(false);
      const p = room.participants.find((p) => p.id === Number(stored));
      if (p) setNickname(p.nickname);
    } else {
      setNeedsNickname(true);
    }
    setLoaded(true);

    // Load chat + vetoes + photos
    fetch(`/api/rooms/${room.code}/chat`).then((r) => r.json()).then(setChatMessages).catch(() => {});
    fetch(`/api/rooms/${room.code}/veto`).then((r) => r.json()).then(setVetoes).catch(() => {});
    fetch(`/api/rooms/${room.code}/photos`).then((r) => r.json()).then(setPhotos).catch(() => {});
  }, [room.code, room.participants]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/rooms/${room.code}/events`);

    eventSource.addEventListener("vote-update", (e) => {
      const votes = JSON.parse(e.data);
      setRoom((prev) => ({ ...prev, votes }));
      playSound("pop");
    });

    eventSource.addEventListener("meal-added", (e) => {
      const meal = JSON.parse(e.data);
      setRoom((prev) => ({ ...prev, meals: [...prev.meals, meal] }));
    });

    eventSource.addEventListener("meal-updated", (e) => {
      const meal = JSON.parse(e.data);
      setRoom((prev) => ({ ...prev, meals: prev.meals.map((m) => (m.id === meal.id ? meal : m)) }));
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
      setRoom((prev) => ({ ...prev, participants: [...prev.participants, participant] }));
      playSound("whoosh");
    });

    eventSource.addEventListener("chat-message", (e) => {
      const msg = JSON.parse(e.data);
      setChatMessages((prev) => [...prev, msg]);
    });

    eventSource.addEventListener("reaction", (e) => {
      const reaction = JSON.parse(e.data);
      if (reaction.emoji.startsWith("cursor:")) {
        const handler = (window as unknown as Record<string, unknown>).__handleCursorReaction;
        if (typeof handler === "function") {
          (handler as (emoji: string, pid: number) => void)(reaction.emoji, reaction.participantId);
        }
      } else {
        const addFloater = (window as unknown as Record<string, unknown>).__addReactionFloater;
        if (typeof addFloater === "function" && reaction.participantId !== Number(localStorage.getItem(`participant-${room.code}`))) {
          (addFloater as (emoji: string) => void)(reaction.emoji);
        }
      }
    });

    eventSource.addEventListener("deadline-set", (e) => {
      const { deadline } = JSON.parse(e.data);
      setRoom((prev) => ({ ...prev, deadline, status: "voting" }));
      playSound("drumroll");
    });

    eventSource.addEventListener("room-finished", (e) => {
      const data = JSON.parse(e.data);
      setRoom((prev) => ({ ...prev, status: "finished", winnerId: data.winnerId, deadline: null }));
      playSound("applause");

      // Store vote summary
      if (data.summary) {
        setVoteSummary(data.summary);
      }

      if (data.isTie && data.tiedMeals) {
        setTiedMeals(data.tiedMeals);
        setShowSpinWheel(true);
      } else if (data.winnerMeal) {
        setWinnerData({ meal: data.winnerMeal, votes: data.winnerVotes, total: data.totalVotes });
        setShowWinner(true);
      }

      // Show summary after a brief delay to let celebration play
      setTimeout(() => setShowSummary(true), 500);
    });

    eventSource.addEventListener("veto", (e) => {
      const veto = JSON.parse(e.data);
      setVetoes((prev) => [...prev, veto]);
    });

    eventSource.addEventListener("photo-added", (e) => {
      const photo = JSON.parse(e.data);
      setPhotos((prev) => [photo, ...prev]);
    });

    return () => eventSource.close();
  }, [room.code, playSound]);

  const handleTimeUp = useCallback(async () => {
    await fetch(`/api/rooms/${room.code}/finish`, { method: "POST" });
  }, [room.code]);

  const handleFinishVoting = useCallback(async () => {
    await fetch(`/api/rooms/${room.code}/finish`, { method: "POST" });
  }, [room.code]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleMoodSet = (newMood: string, tags: string[]) => {
    setMood(newMood || null);
    setMoodTags(tags);
    if (tags.length > 0) {
      setSelectedTags(tags);
    } else {
      setSelectedTags([]);
    }
  };

  // Filter meals by tags + exclude vetoed meals
  const vetoedMealIds = new Set(vetoes.map((v) => v.mealId));
  const activeMeals = room.meals.filter((m) => !vetoedMealIds.has(m.id));
  const filteredMeals = selectedTags.length === 0
    ? activeMeals
    : activeMeals.filter((meal) => {
        if (!meal.tags) return false;
        const mealTags = meal.tags.split(",").map((t) => t.trim());
        return selectedTags.some((t) => mealTags.includes(t));
      });

  const myVote = room.votes.find((v) => v.participantId === participantId);
  const hasUsedVeto = vetoes.some((v) => v.participantId === participantId);

  if (!loaded) return null;

  return (
    <>
      {showAnimation && (
        <WelcomeAnimation onComplete={() => {
          sessionStorage.setItem("flavor-finders-welcomed", "true");
          setShowAnimation(false);
        }} />
      )}
      {needsNickname && (
        <NicknameModal
          roomCode={room.code}
          onJoined={(id) => {
            setParticipantId(id);
            setNeedsNickname(false);
            const p = room.participants.find((p) => p.id === id);
            if (p) setNickname(p.nickname);
          }}
        />
      )}

      {/* Modals */}
      <MealPreviewModal meal={previewMeal} onClose={() => setPreviewMeal(null)} />
      <WinnerCelebration
        show={showWinner}
        meal={winnerData.meal}
        votes={winnerData.votes}
        total={winnerData.total}
        onClose={() => {
          setShowWinner(false);
          if (winnerData.meal) {
            setMapMealName(winnerData.meal.nameEn);
            setShowMap(true);
          }
        }}
      />
      <SpinWheel
        meals={tiedMeals}
        show={showSpinWheel}
        onResult={(meal) => {
          setTimeout(() => {
            setShowSpinWheel(false);
            setWinnerData({ meal, votes: 0, total: room.votes.length });
            setShowWinner(true);
          }, 1500);
        }}
        onClose={() => setShowSpinWheel(false)}
      />
      <RestaurantMap mealName={mapMealName} show={showMap} onClose={() => setShowMap(false)} />
      <SplitBill show={showBill} participantCount={room.participants.length} onClose={() => setShowBill(false)} />
      <PhotoWall
        show={showPhotos}
        photos={photos}
        roomCode={room.code}
        participantId={participantId}
        winnerId={room.winnerId}
        onClose={() => setShowPhotos(false)}
      />

      {/* Overlays */}
      <LiveCursors roomCode={room.code} participantId={participantId} participantNickname={nickname} />
      <FloatingReactions roomCode={room.code} participantId={participantId} />
      <MiniChat roomCode={room.code} participantId={participantId} messages={chatMessages} />

      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-2 sm:px-3 md:px-6 py-2 border-b bg-card shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <h1 className="text-sm sm:text-base md:text-xl font-bold text-orange-600 truncate">Flavor Finders</h1>
            <DarkModeToggle />
            <span className="hidden sm:flex items-center gap-1">
              <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
              <AmbientMusic />
            </span>
            <StreakCounter />
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <CountdownTimer roomCode={room.code} deadline={room.deadline} onTimeUp={handleTimeUp} />
            <span className="hidden sm:inline-flex"><ParticipantAvatars participants={room.participants} /></span>
            <span className="text-muted-foreground text-xs hidden lg:inline">
              <span className="font-mono font-bold tracking-widest text-foreground">{room.code}</span>
            </span>
            <Link href={`/room/${room.code}/share`}>
              <Button size="sm" variant="outline" className="text-xs h-7 px-2 sm:px-3">Share</Button>
            </Link>
            {room.status === "finished" && (
              <>
                <Button size="sm" variant="outline" className="text-xs h-7 px-1.5 sm:px-3" onClick={() => setShowBill(true)}>💰<span className="hidden sm:inline ml-1">Split</span></Button>
                <Button size="sm" variant="outline" className="text-xs h-7 px-1.5 sm:px-3" onClick={() => setShowPhotos(true)}>📸<span className="hidden sm:inline ml-1">Photos</span></Button>
              </>
            )}
            {room.status === "voting" && room.votes.length > 0 && (
              <Button size="sm" className="text-xs h-7 px-2 sm:px-3 bg-green-500 hover:bg-green-600" onClick={handleFinishVoting}><span className="hidden sm:inline">End Vote</span><span className="sm:hidden">End</span></Button>
            )}
            <Link href="/history">
              <Button size="sm" variant="ghost" className="text-xs h-7">🏆</Button>
            </Link>
          </div>
        </header>

        {/* Mood + Tags */}
        <div className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-card border-b shrink-0 space-y-1.5 sm:space-y-2">
          <MoodPicker roomCode={room.code} participantId={participantId} currentMood={mood} onMoodSet={handleMoodSet} />
          <div className="flex items-center gap-2">
            <TagFilter availableTags={AVAILABLE_TAGS} selectedTags={selectedTags} onToggle={handleTagToggle} />
            <div className="flex-1" />
            <Button
              size="sm"
              variant={surpriseMode ? "default" : "outline"}
              className={`text-xs h-7 ${surpriseMode ? "bg-purple-500 hover:bg-purple-600" : ""}`}
              onClick={() => setSurpriseMode(!surpriseMode)}
            >
              🎭 {surpriseMode ? "Normal" : "Surprise"}
            </Button>
          </div>
        </div>

        {/* Vote nudge */}
        <VoteNudge participants={room.participants} votes={room.votes} />

        {/* Vote Summary Banner */}
        {showSummary && voteSummary.length > 0 && room.status === "finished" && (
          <div className="px-2 sm:px-3 md:px-4 py-2 bg-orange-50 border-b shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-semibold text-orange-700">Voting Results</p>
              <Button size="sm" variant="ghost" className="h-5 px-1.5 text-xs text-muted-foreground" onClick={() => setShowSummary(false)}>✕</Button>
            </div>
            <div className="space-y-1">
              {voteSummary.slice(0, 3).map((item, i) => (
                <div key={item.meal.id} className="flex items-center gap-2 text-xs">
                  <span className="font-medium w-4">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                  <span className="font-medium truncate flex-1">{item.meal.nameVi}</span>
                  <span className="text-muted-foreground">{item.count} vote{item.count !== 1 ? "s" : ""} ({item.percentage}%)</span>
                  {item.voters.length > 0 && (
                    <span className="text-muted-foreground hidden sm:inline">— {item.voters.join(", ")}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 min-h-0 overflow-y-auto md:overflow-hidden">
          <div className="md:overflow-y-auto">
            <MealList meals={filteredMeals} roomCode={room.code} onPreview={setPreviewMeal} />
            {/* Vetoed meals */}
            {vetoes.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 rounded-lg">
                <p className="text-xs font-medium text-red-600 mb-1">🚫 Vetoed:</p>
                {room.meals.filter((m) => vetoedMealIds.has(m.id)).map((m) => (
                  <p key={m.id} className="text-xs text-red-400 line-through">{m.nameVi}</p>
                ))}
              </div>
            )}
          </div>

          <div className="md:overflow-y-auto space-y-3">
            <div className="sticky top-0 z-10">
              <RandomPicker roomCode={room.code} meals={filteredMeals} participantId={participantId} />
            </div>
            {surpriseMode ? (
              <SurpriseMode
                meals={filteredMeals}
                roomCode={room.code}
                participantId={participantId}
                currentVoteMealId={myVote?.mealId ?? null}
                onVote={() => {}}
              />
            ) : (
              <VotingSection
                meals={filteredMeals}
                roomCode={room.code}
                participantId={participantId}
                currentVoteMealId={myVote?.mealId ?? null}
              />
            )}
          </div>

          <div className="md:overflow-y-auto">
            <ResultsChart meals={filteredMeals} votes={room.votes} participants={room.participants} />
            <div className="mt-2">
              <InviteCardGenerator roomCode={room.code} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
