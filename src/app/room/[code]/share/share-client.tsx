"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function ShareClient({ code }: { code: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");

  useEffect(() => {
    const url = `${window.location.origin}/room/${code}`;
    setRoomUrl(url);

    if (canvasRef.current) {
      const qrWidth = Math.min(280, window.innerWidth - 120);
      QRCode.toCanvas(canvasRef.current, url, {
        width: qrWidth,
        margin: 2,
        color: {
          dark: "#1f2937",
          light: "#ffffff",
        },
      });
    }
  }, [code]);

  async function handleCopyLink() {
    const shareUrl = `${window.location.origin}/room/${code}/share`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCopyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="bg-orange-500 px-6 py-5 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-4xl mb-2"
            >
              🍜
            </motion.div>
            <h1 className="text-xl font-bold">The Flavor Finders</h1>
            <p className="text-orange-100 text-sm mt-1">Scan to join & vote!</p>
          </div>

          <CardContent className="pt-6 space-y-5">
            {/* QR Code */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="bg-white p-3 rounded-xl shadow-sm border"
              >
                <canvas ref={canvasRef} />
              </motion.div>
            </div>

            {/* Room Code */}
            <div className="text-center space-y-2">
              <p className="text-muted-foreground text-sm">Or enter room code:</p>
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <Badge
                  variant="outline"
                  className="text-2xl font-mono font-bold tracking-[0.3em] px-6 py-2 cursor-pointer hover:bg-accent"
                  onClick={handleCopyCode}
                >
                  {code}
                </Badge>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="w-full"
              >
                {copied ? "Copied!" : "Copy Share Link"}
              </Button>
              <Link href={`/room/${code}`} className="block">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Go to Room
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-xs mt-4">
          Paste this link on Google Chat, Facebook, or Twitter for a rich preview
        </p>
      </motion.div>
    </main>
  );
}
