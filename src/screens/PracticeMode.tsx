import { useCallback, useEffect, useRef, useState } from "react";
import { getDrill } from "../data";
import { plansStore, settingsStore } from "../store";
import { formatClock, formatMinutes } from "../lib/drills";
import { FOCUS_META, Icon } from "../components/Icon";

/* ---------- Sound: short whistle-like beeps via Web Audio ---------- */
let audioCtx: AudioContext | null = null;
function unlockAudio() {
  try {
    audioCtx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (audioCtx.state === "suspended") void audioCtx.resume();
  } catch {
    /* no audio */
  }
}
function beep(times = 3, freq = 1046) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  for (let i = 0; i < times; i++) {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "square";
    o.frequency.value = i === times - 1 ? freq * 1.5 : freq;
    const t = now + i * 0.28;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (i === times - 1 ? 0.5 : 0.18));
    o.connect(g).connect(audioCtx.destination);
    o.start(t);
    o.stop(t + 0.55);
  }
}

/* ---------- Keep the screen awake while the clock runs ---------- */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = () =>
      navigator.wakeLock
        .request("screen")
        .then((l) => {
          if (cancelled) void l.release();
          else lock = l;
        })
        .catch(() => {});
    void request();
    const onVis = () => document.visibilityState === "visible" && void request();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      void lock?.release();
    };
  }, [active]);
}

export function PracticeMode({ planId, onClose }: { planId: string; onClose: () => void }) {
  const plan = plansStore.get().find((p) => p.id === planId);
  const { sound } = settingsStore.use();
  const items = plan?.items ?? [];
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  // Durations can be extended live (+1 min) without editing the saved plan.
  const [durations, setDurations] = useState(() => items.map((i) => i.minutes * 60));
  const [remaining, setRemaining] = useState(durations[0] ?? 0);
  const endAt = useRef<number | null>(null);
  const warned = useRef(false);

  useWakeLock(running);

  const goTo = useCallback(
    (i: number, keepRunning: boolean) => {
      if (i >= items.length) {
        setRunning(false);
        setFinished(true);
        endAt.current = null;
        return;
      }
      const next = Math.max(0, i);
      setIndex(next);
      setRemaining(durations[next]);
      warned.current = false;
      endAt.current = keepRunning ? Date.now() + durations[next] * 1000 : null;
      setRunning(keepRunning);
    },
    [items.length, durations],
  );

  // Tick against wall-clock so the timer stays accurate if the phone sleeps.
  useEffect(() => {
    if (!running) return;
    const h = setInterval(() => {
      if (endAt.current == null) return;
      const left = (endAt.current - Date.now()) / 1000;
      if (left <= 30 && !warned.current && durations[index] > 60) {
        warned.current = true;
        if (sound) beep(1, 880);
      }
      if (left <= 0) {
        if (sound) beep(3);
        goTo(index + 1, true);
      } else setRemaining(left);
    }, 200);
    return () => clearInterval(h);
  }, [running, index, goTo, sound, durations]);

  if (!plan) return null;

  const item = items[index];
  const drill = item?.type === "drill" ? getDrill(item.drillId) : undefined;
  const color = drill ? FOCUS_META[drill.focus].color : "#0A84FF";
  const nextItem = items[index + 1];
  const nextDrill = nextItem?.type === "drill" ? getDrill(nextItem.drillId) : undefined;
  const total = durations[index] || 1;
  const frac = Math.min(1, Math.max(0, remaining / total));
  const R = 46;
  const C = 2 * Math.PI * R;

  const toggle = () => {
    unlockAudio();
    if (running) {
      setRunning(false);
      endAt.current = null;
    } else {
      endAt.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  };
  const addMinute = () => {
    setDurations((d) => d.map((x, i) => (i === index ? x + 60 : x)));
    setRemaining((r) => r + 60);
    if (endAt.current) endAt.current += 60_000;
  };

  const elapsedBefore = durations.slice(0, index).reduce((a, b) => a + b, 0);
  const totalAll = durations.reduce((a, b) => a + b, 0);

  return (
    <div className="practice" style={{ "--c": color } as React.CSSProperties} role="dialog" aria-label="Practice mode">
      <div className="top chrome">
        <button
          className="nav-btn"
          onClick={() => {
            if (finished || confirmEnd) onClose();
            else {
              setConfirmEnd(true);
              setTimeout(() => setConfirmEnd(false), 2500);
            }
          }}
        >
          {finished ? "Close" : confirmEnd ? "Tap to end" : "End"}
        </button>
        <div style={{ fontSize: 15, fontWeight: 600, opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "50vw" }}>{plan.name}</div>
        <button className="nav-btn" onClick={addMinute} disabled={finished} style={{ fontWeight: 600 }}>
          +1 min
        </button>
      </div>

      <div className="progress">
        {items.map((it, i) => {
          const d = it.type === "drill" ? getDrill(it.drillId) : undefined;
          const fill = i < index || finished ? 1 : i === index ? 1 - frac : 0;
          return (
            <i key={it.key} style={{ flex: durations[i], "--c": d ? FOCUS_META[d.focus].color : "#0A84FF" } as React.CSSProperties}>
              <b style={{ transform: `scaleX(${fill})` }} />
            </i>
          );
        })}
      </div>

      {finished ? (
        <div className="done-screen">
          <Icon name="checkCircle" size={72} stroke={1.6} style={{ color: "#30B158" }} />
          <h1>Practice complete</h1>
          <p style={{ opacity: 0.7, margin: 0 }}>
            {formatMinutes(Math.round(totalAll / 60))} · {items.filter((i) => i.type === "drill").length} drills
          </p>
          <button className="btn primary" style={{ maxWidth: 240, marginTop: 20 }} onClick={onClose}>
            Done
          </button>
        </div>
      ) : (
        <>
          <div className="body">
            <div className="kicker">
              {index + 1} of {items.length} · {drill ? drill.focus : "Break"}
            </div>
            <h1>{drill?.name ?? (item?.type === "break" ? item.label : "")}</h1>

            <div className="ring-wrap">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="5" />
                <circle cx="50" cy="50" r={R} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} style={{ transition: running ? "stroke-dashoffset 0.2s linear" : "none" }} />
              </svg>
              <div className="clock">
                <b>{formatClock(remaining)}</b>
                <span>{running ? `Practice ${formatClock(elapsedBefore + (total - remaining))} / ${formatClock(totalAll)}` : "Paused"}</span>
              </div>
            </div>

            {drill && drill.cues.length > 0 && (
              <div className="cue-card">
                <h4>Coaching cues</h4>
                <ul>
                  {drill.cues.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {drill && (
              <details className="cue-card">
                <summary style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,.55)", fontWeight: 700 }}>Setup & steps</summary>
                <p style={{ margin: "8px 0" }}>{drill.setup}</p>
                <ol>
                  {drill.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </details>
            )}
            {!drill && <div className="cue-card" style={{ textAlign: "center" }}>Get water. Next drill starts automatically.</div>}
          </div>

          {nextItem && (
            <div className="next">
              <span>Next</span>
              <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{nextDrill?.name ?? (nextItem.type === "break" ? nextItem.label : "")}</div>
              <div style={{ opacity: 0.6 }}>{Math.round(durations[index + 1] / 60)} min</div>
            </div>
          )}

          <div className="controls chrome">
            <button className="ctrl" onClick={() => goTo(index - 1, running)} disabled={index === 0} aria-label="Previous">
              <Icon name="prev" size={22} stroke={2} />
            </button>
            <button className="ctrl main" onClick={toggle} aria-label={running ? "Pause" : "Start"}>
              <Icon name={running ? "pause" : "play"} size={32} style={running ? undefined : { marginLeft: 4 }} />
            </button>
            <button className="ctrl" onClick={() => goTo(index + 1, running)} aria-label="Next">
              <Icon name="next" size={22} stroke={2} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
