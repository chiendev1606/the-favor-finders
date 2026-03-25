"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Lofi / chill Vietnamese-inspired ambient music generator
function createRelaxTrack(ctx: AudioContext) {
  const master = ctx.createGain();
  master.gain.value = 0.6;

  // Reverb effect using convolution
  const convolver = ctx.createConvolver();
  const reverbLen = ctx.sampleRate * 2.5;
  const reverbBuf = ctx.createBuffer(2, reverbLen, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = reverbBuf.getChannelData(ch);
    for (let i = 0; i < reverbLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 2.5);
    }
  }
  convolver.buffer = reverbBuf;

  const dryGain = ctx.createGain();
  dryGain.gain.value = 0.6;
  const wetGain = ctx.createGain();
  wetGain.gain.value = 0.4;

  dryGain.connect(master);
  convolver.connect(wetGain);
  wetGain.connect(master);
  master.connect(ctx.destination);

  // Vietnamese pentatonic: C4 D4 F4 G4 A4 C5 D5 F5
  const scale = [261.63, 293.66, 349.23, 392.0, 440.0, 523.25, 587.33, 698.46];
  const bassNotes = [130.81, 146.83, 174.61, 196.0]; // C3 D3 F3 G3

  function playNote(freq: number, start: number, dur: number, type: OscillatorType, vol: number, dest: AudioNode) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.value = freq;
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.7;

    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(vol, start + Math.min(0.3, dur * 0.15));
    env.gain.setValueAtTime(vol * 0.8, start + dur * 0.5);
    env.gain.linearRampToValueAtTime(0, start + dur);

    osc.connect(filter);
    filter.connect(env);
    env.connect(dest);
    env.connect(convolver);

    osc.start(start);
    osc.stop(start + dur + 0.1);
  }

  function playChime(freq: number, start: number) {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;
    osc2.type = "sine";
    osc2.frequency.value = freq * 1.002; // slight detune for shimmer

    env.gain.setValueAtTime(0.06, start);
    env.gain.exponentialRampToValueAtTime(0.001, start + 4);

    osc.connect(env);
    osc2.connect(env);
    env.connect(dryGain);
    env.connect(convolver);

    osc.start(start);
    osc2.start(start);
    osc.stop(start + 4.5);
    osc2.stop(start + 4.5);
  }

  // Rain / nature texture
  function playRain(start: number, dur: number) {
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(2, bufSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < bufSize; i++) {
        // Brown noise (warmer than white)
        data[i] = (Math.random() * 2 - 1) * 0.015;
        if (i > 0) data[i] = data[i] * 0.02 + data[i - 1] * 0.98;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0, start);
    rainGain.gain.linearRampToValueAtTime(0.8, start + 2);
    rainGain.gain.setValueAtTime(0.8, start + dur - 2);
    rainGain.gain.linearRampToValueAtTime(0, start + dur);

    source.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(master);
    source.start(start);
    source.stop(start + dur);
  }

  let currentTime = ctx.currentTime + 0.2;
  const LOOP = 40;

  function scheduleLoop() {
    const t = currentTime;

    // Soft rain texture
    playRain(t, LOOP + 2);

    // Bass pad (very slow, warm)
    [0, 10, 20, 30].forEach((offset, i) => {
      playNote(bassNotes[i % bassNotes.length], t + offset, 10, "sine", 0.12, dryGain);
    });

    // Mid-range pad chords
    const chordProg = [
      [0, 2, 4], // C F A
      [1, 3, 5], // D G C5
      [0, 3, 4], // C G A
      [2, 4, 6], // F A D5
    ];
    chordProg.forEach((chord, i) => {
      chord.forEach((idx) => {
        playNote(scale[idx], t + i * 10, 10, "sine", 0.06, dryGain);
      });
    });

    // Melody — sparse, dreamy
    const melody = [
      { n: 4, t: 1.5 }, { n: 5, t: 4 }, { n: 3, t: 7 },
      { n: 6, t: 11 }, { n: 4, t: 14.5 }, { n: 2, t: 17 },
      { n: 5, t: 21 }, { n: 7, t: 24.5 }, { n: 4, t: 27 },
      { n: 3, t: 30.5 }, { n: 5, t: 34 }, { n: 4, t: 37 },
    ];
    melody.forEach(({ n, t: offset }) => {
      playNote(scale[n], t + offset, 2.5, "triangle", 0.1, dryGain);
    });

    // Chimes — ethereal high notes
    [3, 9, 16, 22, 28, 35].forEach((offset) => {
      playChime(scale[4 + Math.floor(Math.random() * 4)], t + offset);
    });

    currentTime = t + LOOP;
  }

  return { scheduleLoop, master };
}

const TRACKS = [
  { id: "lofi", label: "🎵 Lofi Chill", emoji: "🎵" },
  { id: "rain", label: "🌧️ Rain Vibes", emoji: "🌧️" },
  { id: "cafe", label: "☕ Café Jazz", emoji: "☕" },
];

// Different track generators for variety
function createCafeTrack(ctx: AudioContext) {
  const master = ctx.createGain();
  master.gain.value = 0.12;
  master.connect(ctx.destination);

  const jazzScale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
  // Swing-style jazz chords with 7ths
  let currentTime = ctx.currentTime + 0.2;
  const LOOP = 36;

  function playJazzNote(freq: number, start: number, dur: number) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(0.08, start + 0.05);
    env.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(env);
    env.connect(master);
    osc.start(start);
    osc.stop(start + dur + 0.1);
  }

  function scheduleLoop() {
    const t = currentTime;

    // Walking bass
    const bassPattern = [0, 4, 2, 5, 3, 1, 4, 0];
    bassPattern.forEach((n, i) => {
      playJazzNote(jazzScale[n] / 2, t + i * 4.5, 4);
    });

    // Jazz chords (spread)
    [0, 9, 18, 27].forEach((offset, i) => {
      const root = [0, 3, 4, 0][i];
      [root, root + 2, root + 4, root + 6].forEach((n) => {
        if (n < jazzScale.length) {
          playJazzNote(jazzScale[n % jazzScale.length], t + offset, 8);
        }
      });
    });

    // Bebop melody fragments
    const licks = [
      { n: 7, t: 2 }, { n: 5, t: 3.5 }, { n: 6, t: 5 },
      { n: 4, t: 10 }, { n: 5, t: 12 }, { n: 7, t: 13.5 },
      { n: 3, t: 19 }, { n: 5, t: 21 }, { n: 4, t: 23 },
      { n: 6, t: 28 }, { n: 7, t: 30 }, { n: 5, t: 33 },
    ];
    licks.forEach(({ n, t: off }) => {
      playJazzNote(jazzScale[n], t + off, 1.8);
    });

    currentTime = t + LOOP;
  }

  return { scheduleLoop, master };
}

export function AmbientMusic() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [trackId, setTrackId] = useState("lofi");
  const ctxRef = useRef<AudioContext | null>(null);
  const trackRef = useRef<{ scheduleLoop: () => void; master: GainNode } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (ctxRef.current) ctxRef.current.close().catch(() => {});
    };
  }, []);

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (ctxRef.current) ctxRef.current.close().catch(() => {});
    ctxRef.current = null;
    trackRef.current = null;
    intervalRef.current = null;
    setPlaying(false);
  }

  function play(id: string) {
    stop();

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const track = id === "cafe" ? createCafeTrack(ctx) : createRelaxTrack(ctx);
    trackRef.current = track;
    track.master.gain.value = volume / 100;

    track.scheduleLoop();
    intervalRef.current = setInterval(() => {
      track.scheduleLoop();
    }, 35000);

    setTrackId(id);
    setPlaying(true);
  }

  function handleVolume(v: number) {
    setVolume(v);
    if (trackRef.current) {
      trackRef.current.master.gain.value = v / 400;
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-1">
            {!playing ? (
              <Button variant="ghost" size="sm" onClick={() => play("lofi")} className="text-lg px-2">
                🎶
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={stop} className="text-lg px-2 text-orange-500 animate-pulse">
                  🎵
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolume(Number(e.target.value))}
                  className="w-12 h-1 accent-orange-500 cursor-pointer"
                />
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3">
          <div className="space-y-2">
            <p className="text-xs font-medium">{playing ? "Now playing — click 🎵 to stop" : "Pick a vibe"}</p>
            <div className="flex gap-1.5">
              {TRACKS.map((t) => (
                <Button
                  key={t.id}
                  size="sm"
                  variant={playing && trackId === t.id ? "default" : "outline"}
                  className={`text-xs h-7 ${playing && trackId === t.id ? "bg-orange-500" : ""}`}
                  onClick={() => play(t.id)}
                >
                  {t.emoji} {t.label.split(" ").slice(1).join(" ")}
                </Button>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
