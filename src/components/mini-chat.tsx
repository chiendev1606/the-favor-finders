"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: number;
  text: string;
  participantId: number;
  participant: { nickname: string };
  createdAt: string;
};

export function MiniChat({
  roomCode,
  participantId,
  messages,
}: {
  roomCode: string;
  participantId: number | null;
  messages: Message[];
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(messages.length);

  useEffect(() => {
    if (!open && messages.length > prevCount.current) {
      setUnread((u) => u + (messages.length - prevCount.current));
    }
    prevCount.current = messages.length;
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !participantId) return;

    setSending(true);
    await fetch(`/api/rooms/${roomCode}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, text }),
    });
    setText("");
    setSending(false);
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-2"
          >
            <Card className="w-[calc(100vw-2rem)] sm:w-72 md:w-80 shadow-xl">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-semibold text-sm">Convince me! 💬</span>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-6 px-2 text-xs">
                  ✕
                </Button>
              </div>
              <div ref={scrollRef} className="h-48 overflow-y-auto px-3 py-2 space-y-2">
                {messages.length === 0 && (
                  <p className="text-muted-foreground text-xs text-center mt-8">
                    Lobby for your favorite meal!
                  </p>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`text-sm ${msg.participantId === participantId ? "text-right" : ""}`}>
                    <span className="text-xs text-muted-foreground">{msg.participant.nickname}</span>
                    <div
                      className={`inline-block px-3 py-1.5 rounded-lg max-w-[85%] ${
                        msg.participantId === participantId
                          ? "bg-orange-500 text-white ml-auto"
                          : "bg-muted"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSend} className="flex gap-2 p-2 border-t">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="text-sm h-8"
                  disabled={sending}
                />
                <Button type="submit" size="sm" disabled={sending || !text.trim()} className="h-8 bg-orange-500 hover:bg-orange-600">
                  Send
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => { setOpen(!open); setUnread(0); }}
        className="rounded-full w-12 h-12 bg-orange-500 hover:bg-orange-600 shadow-lg text-xl p-0"
      >
        💬
        {unread > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-500 text-[10px] h-5 w-5 p-0 flex items-center justify-center">
            {unread}
          </Badge>
        )}
      </Button>
    </div>
  );
}
