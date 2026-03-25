"use client";

import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Simple sound synthesis using Web Audio API
function playSound(type: "pop" | "drumroll" | "applause" | "whoosh") {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case "pop":
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
        break;
      case "drumroll":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 2);
        break;
      case "applause":
        // Simulate with noise bursts
        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.5));
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const applauseGain = ctx.createGain();
        applauseGain.gain.setValueAtTime(0.15, ctx.currentTime);
        source.connect(applauseGain);
        applauseGain.connect(ctx.destination);
        source.start();
        return;
      case "whoosh":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        break;
    }
  } catch {
    // Audio not supported
  }
}

export function useSoundEffects() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("flavor-finders-sound");
    setEnabled(stored !== "false");
  }, []);

  const play = useCallback(
    (type: "pop" | "drumroll" | "applause" | "whoosh") => {
      if (enabled) playSound(type);
    },
    [enabled]
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("flavor-finders-sound", String(next));
      return next;
    });
  }, []);

  return { play, enabled, toggle };
}

export function SoundToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Button variant="ghost" size="sm" onClick={onToggle} className="text-lg px-2" title={enabled ? "Mute" : "Unmute"}>
      {enabled ? "🔊" : "🔇"}
    </Button>
  );
}
