"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

type DailyConfig = {
  nickname: string;
  time: string; // HH:MM
  enabled: boolean;
};

const STORAGE_KEY = "flavor-finders-daily";

export function DailyRoom() {
  const [config, setConfig] = useState<DailyConfig | null>(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [time, setTime] = useState("11:30");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setConfig(JSON.parse(stored)); } catch {}
    }
  }, []);

  // Check if it's time to auto-create
  useEffect(() => {
    if (!config?.enabled) return;

    const check = () => {
      const now = new Date();
      const [h, m] = config.time.split(":").map(Number);
      const todayKey = `daily-created-${now.toDateString()}`;

      if (now.getHours() === h && now.getMinutes() === m && !sessionStorage.getItem(todayKey)) {
        sessionStorage.setItem(todayKey, "true");
        autoCreate();
      }
    };

    const interval = setInterval(check, 30000); // check every 30s
    check(); // check immediately
    return () => clearInterval(interval);
  }, [config]);

  async function autoCreate() {
    if (!config || creating) return;
    setCreating(true);

    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: config.nickname,
        deadlineUtc: new Date(Date.now() + 30 * 60000).toISOString(), // 30 min default
      }),
    });
    const data = await res.json();
    localStorage.setItem(`participant-${data.code}`, String(data.participantId));
    setCreating(false);
    router.push(`/room/${data.code}`);
  }

  function handleSave() {
    const newConfig: DailyConfig = { nickname: nickname.trim(), time, enabled: true };
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    setEditing(false);
  }

  function handleDisable() {
    setConfig(null);
    localStorage.removeItem(STORAGE_KEY);
    setEditing(false);
  }

  if (editing) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            📅 Daily Lunch Room
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Your nickname</Label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your name"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Auto-create room at</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 text-xs" onClick={handleSave} disabled={!nickname.trim()}>
              Save
            </Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            {config && (
              <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={handleDisable}>
                Disable
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (config?.enabled) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-sm font-medium">Daily lunch at <span className="font-mono text-orange-600">{config.time}</span></p>
                  <p className="text-[10px] text-muted-foreground">as {config.nickname} — auto-creates a 30min room</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] text-green-600 border-green-300">Active</Badge>
                <Button size="sm" variant="ghost" className="text-xs h-6 px-2" onClick={() => { setNickname(config.nickname); setTime(config.time); setEditing(true); }}>
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full text-xs text-muted-foreground"
      onClick={() => setEditing(true)}
    >
      📅 Set up daily lunch room
    </Button>
  );
}
