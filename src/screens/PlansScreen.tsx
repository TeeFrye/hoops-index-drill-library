import { useState } from "react";
import { getDrill } from "../data";
import { AGE_GROUPS, FOCUS_AREAS, SKILLS, type AgeGroup, type Focus, type Plan, type Skill } from "../types";
import { plansStore, savePlan, settingsStore, uid } from "../store";
import { formatMinutes } from "../lib/drills";
import { defaultPlanName, generatePlan } from "../lib/generator";
import { Screen, Segmented, Sheet, Stepper, Toggle, useNav } from "../components/ui";
import { FOCUS_ICON, Icon } from "../components/Icon";
import { useApp } from "../appContext";

export function PlanTimeline({ plan, onHero }: { plan: Plan; onHero?: boolean }) {
  return (
    <div className={`timeline${onHero ? " on-hero" : ""}`}>
      {plan.items.map((it) => (
        <i key={it.key} className={it.type === "break" ? "brk" : ""} style={{ flex: it.minutes }} title={it.type === "drill" ? getDrill(it.drillId)?.name : "Break"} />
      ))}
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
          <Icon name="plus" size={22} weight="bold" />
        </button>
      }
    >
      <button className="cta" onClick={() => setGen(true)}>
        <div className="kicker" style={{ color: "#ff6b72", opacity: 1, marginBottom: 6 }}>Game plan</div>
        <h3>Build my practice</h3>
        <p>Time, roster, focus. Get warm-up, skill blocks and a game to finish.</p>
        <span className="go">
          <Icon name="sparkle" size={18} weight="fill" /> Build it
        </span>
      </button>

      <div className="section-header">
        <span>Your practices</span>
        <button onClick={newBlank}>New blank</button>
      </div>

      {plans.length === 0 ? (
        <div className="empty" style={{ paddingTop: 12 }}>
          <Icon name="clipboard" size={52} weight="duotone" />
          <h3>No practices yet</h3>
          <p>Build one above, or tap “Add to practice” on any drill.</p>
        </div>
      ) : (
        <div className="plan-list">
          {plans.map((p) => {
            const drills = p.items.filter((i) => i.type === "drill").length;
            return (
              <div key={p.id} style={{ position: "relative" }}>
                <button className="plan-card" onClick={() => nav.push({ name: "plan", id: p.id })}>
                  <h3>{p.name}</h3>
                  <div className="sub">
                    {formatMinutes(planTotal(p))} · {drills} {drills === 1 ? "drill" : "drills"}
                    {p.players ? ` · ${p.players} players` : ""}
                    {p.ageGroup ? ` · ${p.ageGroup}` : ""}
                  </div>
                  {p.items.length > 0 && <PlanTimeline plan={p} />}
                </button>
                {p.items.length > 0 && (
                  <button className="play-fab" aria-label={`Start ${p.name}`} onClick={() => app.startPractice(p.id)}>
                    <Icon name="play" size={20} weight="fill" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
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
          <span className="row-icon"><Icon name="users" size={20} weight="duotone" /></span>
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
          <button key={f} className={`chip${focus.includes(f) ? " on" : ""}`} onClick={() => toggle(f)}>
            <Icon name={FOCUS_ICON[f]} size={18} weight={focus.includes(f) ? "fill" : "duotone"} />
            {f}
          </button>
        ))}
      </div>

      <div className="field-label">Options</div>
      <div className="group">
        <div className="row">
          <span className="row-icon"><Icon name="drop" size={20} weight="duotone" /></span>
          <div className="row-main">Water breaks</div>
          <Toggle label="Water breaks" on={breaks} onChange={setBreaks} />
        </div>
        <div className="row">
          <span className="row-icon"><Icon name="heart" size={20} weight="duotone" /></span>
          <div className="row-main">Conditioning block</div>
          <Toggle label="Conditioning block" on={cond} onChange={setCond} />
        </div>
      </div>
      <p className="footnote">Every plan starts with a warm-up and finishes with a competitive team drill. You can reorder, swap or change times afterwards.</p>

      <div className="field-pad" style={{ marginTop: 20 }}>
        <button className="btn primary" onClick={build}>
          <Icon name="sparkle" size={20} weight="fill" /> Build {minutes}-min practice
        </button>
      </div>
    </Sheet>
  );
}
