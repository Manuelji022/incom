"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "incom-theme";

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

function readSavedTheme(): Theme | null {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(savedTheme) ? savedTheme : null;
  } catch {
    return null;
  }
}

function saveTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The theme still changes for this session when storage is unavailable.
  }
}

function applyTheme(theme: Theme | null) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (theme) {
    root.classList.add(theme);
  }
}

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getActiveTheme(): Theme {
  const root = document.documentElement;

  if (root.classList.contains("dark")) {
    return "dark";
  }

  if (root.classList.contains("light")) {
    return "light";
  }

  return getSystemTheme();
}

export function ThemeToggle({ label }: { label: string }) {
  useEffect(() => {
    applyTheme(readSavedTheme());
  }, []);

  function toggleTheme() {
    const currentTheme = getActiveTheme();
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    saveTheme(nextTheme);
  }

  return (
    <Button
      aria-label={label}
      className="theme-toggle"
      onClick={toggleTheme}
      size="icon-sm"
      title={label}
      variant="ghost"
    >
      <span className="theme-toggle__icon theme-toggle__icon--sun">
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 2v2m0 16v2m10-10h-2M4 12H2m17.07 7.07-1.42-1.42M6.35 6.35 4.93 4.93m14.14 0-1.42 1.42m-11.3 11.3-1.42 1.42"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      </span>
      <span className="theme-toggle__icon theme-toggle__icon--moon">
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path
            d="M20.4 14.3A8.5 8.5 0 0 1 9.7 3.6 8.6 8.6 0 1 0 20.4 14.3Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </span>
    </Button>
  );
}
