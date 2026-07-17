"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black hover:bg-black/10 transition-colors dark:border-gray-400 dark:hover:bg-white/10"
    >
      {mounted ? (theme === "dark" ? <Sun size={15} /> : <Moon size={15} />) : <span className="block w-3 h-3 bg-black/20 rounded-full dark:bg-white/20" />}
    </button>
  );
}
