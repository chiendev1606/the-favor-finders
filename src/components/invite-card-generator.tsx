"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

export function InviteCardGenerator({
  roomCode,
}: {
  roomCode: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function generateCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = Math.min(1, window.innerWidth / 600);
    canvas.width = 600;
    canvas.height = 400;
    canvas.style.maxWidth = `${600 * scale}px`;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, "#FFF7ED");
    gradient.addColorStop(0.5, "#FFEDD5");
    gradient.addColorStop(1, "#FED7AA");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Emojis
    ctx.font = "36px serif";
    ctx.textAlign = "center";
    ctx.fillText("🍜  🥢  🍲  🥘  🍛", 300, 60);

    // Title
    ctx.font = "bold 40px sans-serif";
    ctx.fillStyle = "#EA580C";
    ctx.fillText("The Flavor Finders", 300, 130);

    // Subtitle
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#9A3412";
    ctx.fillText("Vote on what to eat together!", 300, 170);

    // Room code box
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.roundRect(150, 200, 300, 100, 16);
    ctx.fill();
    ctx.shadowColor = "rgba(0,0,0,0.1)";
    ctx.shadowBlur = 10;

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#78716C";
    ctx.fillText("Join with code", 300, 235);

    ctx.font = "bold 42px monospace";
    ctx.fillStyle = "#1F2937";
    ctx.fillText(roomCode, 300, 280);

    // URL
    ctx.font = "13px sans-serif";
    ctx.fillStyle = "#A8A29E";
    ctx.shadowBlur = 0;
    ctx.fillText(`${window.location.origin}/room/${roomCode}`, 300, 350);
    ctx.fillText("Scan QR or click link to join 🗳️", 300, 375);

    // Download
    const link = document.createElement("a");
    link.download = `flavor-finders-${roomCode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function copyToClipboard() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Regenerate first
    await generateCard();

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
      } catch {
        // Fallback: download instead
      }
    });
  }

  return (
    <div className="space-y-2">
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-xs flex-1" onClick={generateCard}>
          📥 Download Card
        </Button>
        <Button size="sm" variant="outline" className="text-xs flex-1" onClick={copyToClipboard}>
          📋 Copy Card
        </Button>
      </div>
    </div>
  );
}
