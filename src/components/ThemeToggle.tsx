"use client";

import { useSyncExternalStore } from "react";
import { getTheme, setTheme, subscribeToTheme } from "@/lib/theme";
import type { Content } from "@/types/content";

interface Props {
  labels: Content["ui"]["theme"];
}

export function ThemeToggle({ labels }: Props) {
  // No servidor o tema é desconhecido (depende do navegador); o rótulo
  // definitivo aparece na hidratação.
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, () => null);
  const label =
    theme === null ? labels.toggle : theme === "dark" ? labels.toLight : labels.toDark;

  return (
    <button
      type="button"
      onClick={() => setTheme(getTheme() === "dark" ? "light" : "dark")}
      aria-label={label}
      className="inline-flex size-10 items-center justify-center rounded-md text-grafite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ambar"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
    </button>
  );
}
