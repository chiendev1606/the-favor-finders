"use client";

import { useState, useEffect } from "react";
import { CreateRoomForm } from "@/components/create-room-form";
import { JoinRoomForm } from "@/components/join-room-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WelcomeAnimation } from "@/components/welcome-animation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("flavor-finders-welcomed");
    if (!seen) {
      setShowAnimation(true);
    } else {
      setAnimationDone(true);
    }
  }, []);

  function handleAnimationComplete() {
    sessionStorage.setItem("flavor-finders-welcomed", "true");
    setShowAnimation(false);
    setAnimationDone(true);
  }

  return (
    <>
      {showAnimation && <WelcomeAnimation onComplete={handleAnimationComplete} />}

      {animationDone && (
        <main className="max-w-md mx-auto px-4 py-8 sm:py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">
              The Flavor Finders
            </h1>
            <p className="text-muted-foreground">Vote on what to eat together</p>
            <Link href="/history" className="inline-block mt-3">
              <Button variant="ghost" size="sm" className="text-orange-500">
                🏆 Hall of Fame
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create a Room</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateRoomForm />
              </CardContent>
            </Card>

            <div className="relative flex items-center">
              <Separator className="flex-1" />
              <span className="mx-4 text-muted-foreground text-sm">or</span>
              <Separator className="flex-1" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Join a Room</CardTitle>
              </CardHeader>
              <CardContent>
                <JoinRoomForm />
              </CardContent>
            </Card>
          </div>
        </main>
      )}
    </>
  );
}
