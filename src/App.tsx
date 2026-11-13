import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppContext, type AppActions, type Tab } from "./appContext";
import { Icon, type IconName } from "./components/Icon";
import { NavContext, ToastHost, type Route } from "./components/ui";
import { settingsStore } from "./store";
import { DrillsScreen } from "./screens/DrillsScreen";
import { DrillDetailScreen } from "./screens/DrillDetailScreen";
import { PlansScreen } from "./screens/PlansScreen";
import { PlanScreen } from "./screens/PlanScreen";
import { SavedScreen } from "./screens/SavedScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { PracticeMode } from "./screens/PracticeMode";

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: "drills", label: "Drills", icon: "ball" },
  { id: "plans", label: "Practices", icon: "clipboard" },
  { id: "saved", label: "Saved", icon: "star" },
  { id: "settings", label: "Settings", icon: "gear" },
];

interface StackEntry {
  key: string;
  route: Route;
  state: "enter" | "idle" | "leave";
}

let keySeq = 0;
const entry = (route: Route, state: StackEntry["state"] = "idle"): StackEntry => ({ key: `r${keySeq++}`, route, state });

function renderRoute(r: Route) {
  switch (r.name) {
    case "drills":
      return <DrillsScreen />;
    case "drill":
      return <DrillDetailScreen id={r.id} />;
    case "plans":
      return <PlansScreen />;
    case "plan":
      return <PlanScreen id={r.id} />;
    case "saved":
      return <SavedScreen />;
    case "settings":
      return <SettingsScreen />;
  }
}

function useTheme() {
  const { theme } = settingsStore.use();
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);
}

/** One navigation stack (per tab) with iOS-style push/pop and edge swipe-back. */
function Stack({ entries, onPush, onPop, onPopDone, hidden }: { entries: StackEntry[]; onPush: (r: Route) => void; onPop: () => void; onPopDone: (key: string) => void; hidden: boolean }) {
  const topRef = useRef<HTMLDivElement | null>(null);
  const swipe = useRef<{ x0: number; y0: number; dx: number; active: boolean; locked: boolean } | null>(null);
  const live = entries.filter((e) => e.state !== "leave");
  const depth = live.length - 1;

  const nav = useMemo(() => ({ push: onPush, pop: onPop, depth }), [onPush, onPop, depth]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (depth > 0 && t.clientX < 28) swipe.current = { x0: t.clientX, y0: t.clientY, dx: 0, active: false, locked: false };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const s = swipe.current;
    const el = topRef.current;
    if (!s || !el) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x0;
    const dy = t.clientY - s.y0;
    if (!s.active && !s.locked) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
        swipe.current = null;
        return;
      }
      if (dx > 8) s.active = true;
    }
    if (!s.active) return;
    s.dx = Math.max(0, dx);
    el.classList.add("dragging");
    el.style.transform = `translateX(${s.dx}px)`;
  };
  const onTouchEnd = () => {
    const s = swipe.current;
    const el = topRef.current;
    swipe.current = null;
    if (!s?.active || !el) return;
    el.style.transition = "transform 0.25s cubic-bezier(.2,.9,.25,1)";
    if (s.dx > window.innerWidth * 0.33) {
      el.style.transform = "translateX(100%)";
      setTimeout(() => {
        el.style.transition = "";
        el.style.transform = "";
        el.classList.remove("dragging");
        onPop();
      }, 230);
    } else {
      el.style.transform = "";
      setTimeout(() => {
        el.style.transition = "";
        el.classList.remove("dragging");
      }, 260);
    }
  };

  return (
    <div className="tab-root" hidden={hidden} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {entries.map((en, i) => {
        const isTop = i === entries.length - 1 || (en.state !== "leave" && entries.slice(i + 1).every((x) => x.state === "leave"));
        const liveIndex = live.indexOf(en);
        const covered = en.state !== "leave" && liveIndex >= 0 && liveIndex < live.length - 1;
        const farBelow = liveIndex >= 0 && liveIndex < live.length - 2;
        return (
          <div
            key={en.key}
            ref={isTop && en.state !== "leave" ? topRef : undefined}
            className={`screen${en.state === "enter" ? " enter" : ""}${en.state === "leave" ? " leave" : ""}${covered ? " covered" : ""}`}
            style={{ display: farBelow ? "none" : undefined, zIndex: i }}
            onAnimationEnd={(ev) => {
              if (ev.target !== ev.currentTarget) return;
              if (en.state === "leave") onPopDone(en.key);
            }}
          >
            <NavContext.Provider value={{ ...nav, depth: liveIndex < 0 ? depth : liveIndex }}>{renderRoute(en.route)}</NavContext.Provider>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  useTheme();
  const [tab, setTab] = useState<Tab>("drills");
  const [stacks, setStacks] = useState<Record<Tab, StackEntry[]>>(() => ({
    drills: [entry({ name: "drills" })],
    plans: [entry({ name: "plans" })],
    saved: [entry({ name: "saved" })],
    settings: [entry({ name: "settings" })],
  }));
  const [practice, setPractice] = useState<string | null>(null);

  const push = useCallback((t: Tab, r: Route) => setStacks((s) => ({ ...s, [t]: [...s[t].filter((e) => e.state !== "leave"), entry(r, "enter")] })), []);
  const pop = useCallback(
    (t: Tab) =>
      setStacks((s) => {
        const live = s[t].filter((e) => e.state !== "leave");
        if (live.length <= 1) return s;
        const top = live[live.length - 1];
        return { ...s, [t]: s[t].map((e) => (e.key === top.key ? { ...e, state: "leave" as const } : e)) };
      }),
    [],
  );
  const popDone = useCallback((t: Tab, key: string) => setStacks((s) => ({ ...s, [t]: s[t].filter((e) => e.key !== key) })), []);

  const pushers = useMemo(
    () => Object.fromEntries(TABS.map(({ id }) => [id, { push: (r: Route) => push(id, r), pop: () => pop(id) }])) as Record<Tab, { push: (r: Route) => void; pop: () => void }>,
    [push, pop],
  );

  const onTabPress = (t: Tab) => {
    if (t === tab) {
      // Tapping the active tab pops to root, like iOS.
      setStacks((s) => ({ ...s, [t]: [s[t][0]] }));
    }
    setTab(t);
  };

  const actions = useMemo<AppActions>(
    () => ({
      startPractice: (id) => setPractice(id),
      goTo: (t, r) => {
        setTab(t);
        if (r) push(t, r);
      },
    }),
    [push],
  );

  return (
    <AppContext.Provider value={actions}>
      <div className="app">
        <ToastHost>
          {TABS.map(({ id }) => (
            <Stack key={id} entries={stacks[id]} hidden={tab !== id} onPush={pushers[id].push} onPop={pushers[id].pop} onPopDone={(k) => popDone(id, k)} />
          ))}
          <nav className="tabbar" aria-label="Main">
            {TABS.map((t) => (
              <button key={t.id} className={`tab${tab === t.id ? " active" : ""}`} onClick={() => onTabPress(t.id)} aria-current={tab === t.id ? "page" : undefined}>
                <Icon name={t.icon} size={25} stroke={tab === t.id ? 2.2 : 1.9} fill={t.id === "saved" && tab === t.id} />
                {t.label}
              </button>
            ))}
          </nav>
          {practice && <PracticeMode planId={practice} onClose={() => setPractice(null)} />}
        </ToastHost>
      </div>
    </AppContext.Provider>
  );
}
