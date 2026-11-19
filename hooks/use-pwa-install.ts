"use client";

import { useCallback, useSyncExternalStore } from "react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
type InstallState = { prompt: InstallPromptEvent | null; installed: boolean };

let state: InstallState = { prompt: null, installed: false };
const listeners = new Set<() => void>();
let attached = false;

function set(next: InstallState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

function attach(): void {
  if (attached || typeof window === "undefined") return;
  attached = true;
  if (window.matchMedia("(display-mode: standalone)").matches) state = { ...state, installed: true };
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    set({ ...state, prompt: event as InstallPromptEvent });
  });
  window.addEventListener("appinstalled", () => set({ prompt: null, installed: true }));
}

function subscribe(listener: () => void): () => void {
  attach();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const SERVER_STATE: InstallState = { prompt: null, installed: false };

/** Install-to-home-screen state: the browser's prompt (Chromium) or an installed flag. */
export function usePwaInstall() {
  const current = useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);

  const install = useCallback(async (): Promise<boolean> => {
    const prompt = state.prompt;
    if (!prompt) return false;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    set({ ...state, prompt: null });
    return outcome === "accepted";
  }, []);

  return { canPrompt: current.prompt !== null, isInstalled: current.installed, install };
}
