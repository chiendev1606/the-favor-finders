"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Restaurant = {
  name: string;
  why: string;
  price: string;
  tip: string;
};

const PRICE_EMOJI: Record<string, string> = {
  cheap: "💰",
  moderate: "💰💰",
  fancy: "💰💰💰",
};

export function AiRestaurants({
  mealName,
  show,
  onClose,
}: {
  mealName: string;
  show: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function fetchRestaurants() {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealName }),
      });
      const data = await res.json();
      if (data.restaurants) {
        setRestaurants(data.restaurants);
        setLoaded(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  // Fetch when dialog opens
  if (show && !loaded && !loading) {
    fetchRestaurants();
  }

  if (!show) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🤖</span>
            Where to eat {mealName}?
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-4xl mb-3"
            >
              🔍
            </motion.div>
            <p className="text-sm text-muted-foreground">AI is scouting the best spots...</p>
            <div className="flex gap-1 justify-center mt-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-violet-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {restaurants.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                >
                  <Card className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.why}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {PRICE_EMOJI[r.price] || r.price}
                      </Badge>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs bg-accent/50 rounded-md p-2">
                      <span>💡</span>
                      <span className="text-muted-foreground">{r.tip}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {restaurants.length > 0 && (
              <p className="text-[10px] text-muted-foreground text-center">
                Powered by AI — suggestions may not be accurate
              </p>
            )}

            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
