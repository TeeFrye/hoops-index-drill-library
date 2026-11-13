import { useState } from "react";
import { getDrill } from "../data";
import { AGE_GROUPS, FOCUS_AREAS, SKILLS, type AgeGroup, type Focus, type Plan, type Skill } from "../types";
import { plansStore, savePlan, settingsStore, uid } from "../store";
import { formatMinutes } from "../lib/drills";
import { defaultPlanName, generatePlan } from "../lib/generator";
import { Screen, Segmented, Sheet, Stepper, Toggle, useNav } from "../components/ui";
import { FOCUS_META, Icon } from "../components/Icon";
import { useApp } from "../appContext";

export function PlanTimeline({ plan }: { plan: Plan }) {
  return (
    <div className="timeline">
      {plan.items.map((it) => {
        const d = it.type === "drill" ? getDrill(it.drillId) : undefined;
        return <i key={it.key} className={it.type === "break" ? "brk" : ""} style={{ flex: it.minutes, "--c": d ? FOCUS_META[d.focus]?.color : undefined } as React.CSSProperties} />;
      })}
    </div>
  );
}

export const planTotal = (p: Plan) => p.items.reduce((a, b) => a + b.minutes, 0);

export function PlansScreen() {
  const plans = plansStore.use();
  const nav = useNav();
  const app = useApp();
  const [gen, setGen] = useState(false);

  const newBlank = () => {
    const id = uid();
    savePlan({ id, name: "New practice", createdAt: Date.now(), updatedAt: Date.now(), items: [] });
    nav.push({ name: "plan", id });
  };

  return (
    <Screen
      title="Practices"
      large
      subtitle="Plan it in the parking lot. Run it from the sideline."
      right={
        <button className="nav-btn icon" onClick={newBlank} aria-label="New blank practice">
          <Icon name="plus" size={26} stroke={2.4} />
        </button>
      }
    >
      <button className="hero-cta" onClick={() => setGen(true)}>
        <h3>Build a practice for me</h3>
        <p>Pick your time, roster and focus. Get a full plan with warm-up, skill blocks and a game to finish.</p>
        <svg className="ball" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.4">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3v18M5.6 5.6c2.3 1.7 3.6 4 3.6 6.4s-1.3 4.7-3.6 6.4M18.4 5.6c-2.3 1.7-3.6 4-3.6 6.4s1.3 4.7 3.6 6.4" />
        </svg>
      </button>

      <div className="section-header">
        <span>Your practices</span>
        <button onClick={newBlank}>New blank</button>
      </div>

      {plans.length === 0 ? (
        <div className="empty" style={{ paddingTop: 16 }}>
          <Icon name="clipboard" size={44} stroke={1.6} />
          <h3>No practices yet</h3>
          <p>Build one above, or tap “Add to practice” on any drill.</p>
        </div>
      ) : (
        plans.map((p) => {
          const drills = p.items.filter((i) => i.type === "drill").length;
          return (
            <div key={p.id} style={{ position: "relative" }}>
              <button className="plan-card" onClick={() => nav.push({ name: "plan", id: p.id })}>
                <h3 style={{ paddingRight: 56 }}>{p.name}</h3>
                <div className="sub">
                  {formatMinutes(planTotal(p))} · {drills} {drills === 1 ? "drill" : "drills"}
                  {p.players ? ` · ${p.players} players` : ""}
                  {p.ageGroup ? ` · ${p.ageGroup}` : ""}
                </div>
                {p.items.length > 0 && <PlanTimeline plan={p} />}
              </button>
              {p.items.length > 0 && (
                <button
                  aria-label={`Start ${p.name}`}
                  onClick={() => app.startPractice(p.id)}
                  style={{ position: "absolute", right: 30, top: 14, width: 40, height: 40, borderRadius: 20, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center" }}
                >
                  <Icon name="play" size={18} style={{ marginLeft: 2 }} />
                </button>
              )}
            </div>
          );
        })
      )}
      <GeneratorSheet open={gen} onClose={() => setGen(false)} onCreated={(id) => nav.push({ name: "plan", id })} />
    </Screen>
  );
}

const TIME_OPTS = ["30", "45", "60", "75", "90", "120"] as const;

export function GeneratorSheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const settings = settingsStore.use();
  const [minutes, setMinutes] = useState<(typeof TIME_OPTS)[number]>("60");
  const [players, setPlayers] = useState(settings.players);
  const [age, setAge] = useState<AgeGroup>(settings.ageGroup);
  const [skill, setSkill] = useState<Skill>("Beginner");
  const [focus, setFocus] = useState<Focus[]>(["Ball Handling", "Shooting"]);
  const [breaks, setBreaks] = useState(true);
  const [cond, setCond] = useState(false);

  const toggle = (f: Focus) => setFocus((p) => (p.includes(f) ? p.filter((x) => x !== f) : p.length >= 3 ? [...p.slice(1), f] : [...p, f]));
  const pickable = FOCUS_AREAS.filter((f) => f !== "Warm-Up" && f !== "Conditioning" && f !== "Team Concepts");

  const build = () => {
    const input = { minutes: Number(minutes), players, ageGroup: age, skill, focus, conditioning: cond, waterBreaks: breaks };
    const id = uid();
    savePlan({ id, name: defaultPlanName(input), createdAt: Date.now(), updatedAt: Date.now(), players, ageGroup: age, items: generatePlan(input) });
    onClose();
    setTimeout(() => onCreated(id), 200);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Build a practice" full left={<button className="nav-btn" onClick={onClose}>Cancel</button>}>
      <div className="field-label">Practice length (minutes)</div>
      <div className="field-pad">
        <Segmented options={TIME_OPTS} value={minutes} onChange={setMinutes} />
      </div>

      <div className="field-label">Team</div>
      <div className="group">
        <div className="row">
          <Icon name="users" size={20} style={{ color: "var(--label-2)" }} />
          <div className="row-main">Players</div>
          <Stepper value={players} min={1} max={30} onChange={setPlayers} />
        </div>
      </div>
      <div style={{ height: 12 }} />
      <div className="field-pad">
        <Segmented options={AGE_GROUPS} value={age} onChange={setAge} labels={{ "U8–U10": "U8–10", "U10–U12": "U10–12", "U12–U14": "U12–14" }} />
      </div>
      <div style={{ height: 10 }} />
      <div className="field-pad">
        <Segmented options={SKILLS} value={skill} onChange={setSkill} />
      </div>

      <div className="field-label">Focus on (up to 3)</div>
      <div className="wrap-chips">
        {pickable.map((f) => (
          <button key={f} className={`chip${focus.includes(f) ? " on" : ""}`} style={{ "--chip-color": FOCUS_META[f].color } as React.CSSProperties} onClick={() => toggle(f)}>
            <span className="dot" />
            {f}
          </button>
        ))}
      </div>

      <div className="field-label">Options</div>
      <div className="group">
        <div className="row">
          <Icon name="drop" size={20} style={{ color: "#0A84FF" }} />
          <div className="row-main">Water breaks</div>
          <Toggle label="Water breaks" on={breaks} onChange={setBreaks} />
        </div>
        <div className="row" style={{ "--inset": "48px" } as React.CSSProperties}>
          <Icon name="heart" size={20} style={{ color: FOCUS_META.Conditioning.color }} />
          <div className="row-main">Conditioning block</div>
          <Toggle label="Conditioning block" on={cond} onChange={setCond} />
        </div>
      </div>
      <p className="footnote">Every plan starts with a warm-up and finishes with a competitive team drill. You can reorder, swap or change times afterwards.</p>

      <div className="field-pad" style={{ marginTop: 20 }}>
        <button className="btn primary" onClick={build}>
          <Icon name="sparkle" size={20} stroke={2.4} /> Build {minutes}-minute practice
        </button>
      </div>
    </Sheet>
  );
}
