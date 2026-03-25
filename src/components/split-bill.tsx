"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SplitBill({
  show,
  participantCount,
  onClose,
}: {
  show: boolean;
  participantCount: number;
  onClose: () => void;
}) {
  const [total, setTotal] = useState("");
  const [tip, setTip] = useState("0");

  if (!show) return null;

  const totalNum = parseFloat(total) || 0;
  const tipNum = parseFloat(tip) || 0;
  const grandTotal = totalNum + (totalNum * tipNum) / 100;
  const perPerson = participantCount > 0 ? grandTotal / participantCount : 0;

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>💰 Split the Bill</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Total Bill</Label>
            <Input
              type="number"
              placeholder="e.g. 500000"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Tip %</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[0, 5, 10, 15, 20].map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={tip === String(t) ? "default" : "outline"}
                  className={`text-xs min-w-[40px] ${tip === String(t) ? "bg-orange-500" : ""}`}
                  onClick={() => setTip(String(t))}
                >
                  {t}%
                </Button>
              ))}
            </div>
          </div>

          {totalNum > 0 && (
            <Card className="bg-orange-50 dark:bg-orange-950/30">
              <CardContent className="pt-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground">{participantCount} people</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                  {Math.ceil(perPerson).toLocaleString()}đ
                </p>
                <p className="text-xs text-muted-foreground">per person</p>
                {tipNum > 0 && (
                  <p className="text-xs text-muted-foreground">
                    (incl. {tipNum}% tip = {Math.ceil(grandTotal).toLocaleString()}đ total)
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Button variant="outline" onClick={onClose} className="w-full">Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
