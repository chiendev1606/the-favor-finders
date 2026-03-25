"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

export function VoiceRecorder({
  roomCode,
  mealId,
  existingUrl,
}: {
  roomCode: string;
  mealId: number;
  existingUrl: string | null;
}) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingUrl);
  const [uploading, setUploading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());

        // Upload
        setUploading(true);
        const formData = new FormData();
        formData.append("file", blob, "voice.webm");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        // Save to meal
        await fetch(`/api/rooms/${roomCode}/voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mealId, voiceUrl: data.url }),
        });

        setAudioUrl(data.url);
        setUploading(false);
      };

      recorder.start();
      setRecording(true);

      // Auto-stop after 10s
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          setRecording(false);
        }
      }, 10000);
    } catch {
      // Microphone not available
    }
  }

  function stopRecording() {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {audioUrl && (
        <audio src={audioUrl} controls className="h-7 max-w-[140px]" />
      )}
      {!recording && !uploading && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={startRecording}
        >
          🎙️ {audioUrl ? "Re-record" : "Record"}
        </Button>
      )}
      {recording && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-red-500 animate-pulse"
          onClick={stopRecording}
        >
          ⏹ Stop ({"\u2264"}10s)
        </Button>
      )}
      {uploading && <span className="text-xs text-muted-foreground">Saving...</span>}
    </div>
  );
}
