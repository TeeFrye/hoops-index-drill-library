import { useSyncExternalStore } from "react";
import type { Drill, Plan, Settings } from "./types";

/**
 * Tiny localStorage-backed stores. Every read/write is wrapped so the app
 * still works in private browsing or when storage is unavailable.
 */
function createStore<T>(key: string, initial: T) {
  let value: T = initial;
  try {
    const raw = localStorage.getItem(key);
    if (raw != null) {
      const parsed = JSON.parse(raw);
      value = (Array.isArray(initial) ? parsed : { ...(initial as object), ...parsed }) as T;
    }
  } catch {
    /* ignore */
  }
  const listeners = new Set<() => void>();
  const store = {
    get: () => value,
    set(next: T | ((prev: T) => T)) {
      value = typeof next === "function" ? (next as (p: T) => T)(value) : next;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* ignore */
      }
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    use(): T {
      return useSyncExternalStore(store.subscribe, store.get, store.get);
    },
  };
  return store;
}

// Keys kept compatible with v1 where possible.
export const favoritesStore = createStore<string[]>("hi.favorites", []);
export const plansStore = createStore<Plan[]>("hi.plans", []);
export const notesStore = createStore<Record<string, string>>("hi.notes", {});
export const recentStore = createStore<string[]>("hi.recent", []);
export const settingsStore = createStore<Settings>("hi.settings", {
  theme: "system",
  players: 10,
  ageGroup: "U10–U12",
  sound: true,
});

export const idKey = (id: Drill["id"]) => String(id);

export function toggleFavorite(id: Drill["id"]) {
  const k = idKey(id);
  favoritesStore.set((f) => (f.includes(k) ? f.filter((x) => x !== k) : [k, ...f]));
}

export function markRecent(id: Drill["id"]) {
  const k = idKey(id);
  recentStore.set((r) => [k, ...r.filter((x) => x !== k)].slice(0, 15));
}

export function savePlan(plan: Plan) {
  const updated = { ...plan, updatedAt: Date.now() };
  plansStore.set((ps) =>
    ps.some((p) => p.id === plan.id) ? ps.map((p) => (p.id === plan.id ? updated : p)) : [updated, ...ps],
  );
}

export function deletePlan(id: string) {
  plansStore.set((ps) => ps.filter((p) => p.id !== id));
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function exportData() {
  return JSON.stringify(
    {
      app: "hoops-index",
      version: 2,
      exportedAt: new Date().toISOString(),
      favorites: favoritesStore.get(),
      plans: plansStore.get(),
      notes: notesStore.get(),
      settings: settingsStore.get(),
    },
    null,
    2,
  );
}

export function importData(json: string) {
  const d = JSON.parse(json);
  if (d?.app !== "hoops-index") throw new Error("This file isn't a Hoops Index backup.");
  if (Array.isArray(d.favorites)) favoritesStore.set(d.favorites);
  if (Array.isArray(d.plans)) plansStore.set(d.plans);
  if (d.notes && typeof d.notes === "object") notesStore.set(d.notes);
  if (d.settings && typeof d.settings === "object") settingsStore.set((s) => ({ ...s, ...d.settings }));
}

export function resetAll() {
  favoritesStore.set([]);
  plansStore.set([]);
  notesStore.set({});
  recentStore.set([]);
}
