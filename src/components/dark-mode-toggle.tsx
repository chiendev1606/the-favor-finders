"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("flavor-finders-dark");
    if (stored === "true") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("flavor-finders-dark", String(next));
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="text-lg px-2"
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? "☀️" : "🌙"}
    </Button>
  );
}
