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
      aria-label={
        mounted
          ? theme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode"
          : "Toggle theme"
      }
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
    >
      {mounted ? (
        theme === "dark" ? (
          <Sun size={15} />
        ) : (
          <Moon size={15} />
        )
      ) : (
        <span className="block h-4 w-4 rounded bg-muted-foreground/20" />
      )}
    </button>
  );
}
