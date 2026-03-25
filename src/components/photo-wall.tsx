"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

type Photo = { id: number; url: string; participantId: number; participant: { nickname: string }; createdAt: string };

export function PhotoWall({
  show,
  photos,
  roomCode,
  participantId,
  winnerId,
  onClose,
}: {
  show: boolean;
  photos: Photo[];
  roomCode: string;
  participantId: number | null;
  winnerId: number | null;
  onClose: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !participantId || !winnerId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    await fetch(`/api/rooms/${roomCode}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, mealId: winnerId, url: data.url }),
    });
    setUploading(false);
  }

  if (!show) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📸 Meal Photos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload */}
          <div className="text-center">
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {uploading ? "Uploading..." : "📷 Upload your photo"}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </div>

          {/* Gallery */}
          {photos.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              No photos yet. Be the first to share!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <AnimatePresence>
                {photos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative aspect-square rounded-lg overflow-hidden"
                  >
                    <Image src={photo.url} alt="" fill className="object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <p className="text-white text-xs">{photo.participant.nickname}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <Button variant="outline" onClick={onClose} className="w-full">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
