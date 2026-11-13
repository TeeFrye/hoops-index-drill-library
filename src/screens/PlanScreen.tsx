import { useDeferredValue, useMemo, useState } from "react";
import { DRILLS, getDrill } from "../data";
import { FOCUS_AREAS, type Focus, type Plan, type PlanItem } from "../types";
import { deletePlan, plansStore, savePlan, uid } from "../store";
import { EMPTY_FILTERS, filterDrills, formatMinutes } from "../lib/drills";
import { generatePlan } from "../lib/generator";
import { Screen, Sheet, Stepper, useNav, useToast } from "../components/ui";
import { FOCUS_ICON, FocusBadge, Icon } from "../components/Icon";
import { DrillRow } from "../components/DrillRow";
import { useApp } from "../appContext";
import { PlanTimeline, planTotal } from "./PlansScreen";

const clock = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

export function planAsText(p: Plan) {
  let t = 0;
  const lines = p.items.map((it) => {
    const start = clock(t);
    t += it.minutes;
    if (it.type === "break") return `${start}  ${it.label} (${it.minutes} min)`;
    const d = getDrill(it.drillId);
    return `${start}  ${d?.name ?? "Drill"} — ${it.minutes} min${d ? ` [${d.focus}]` : ""}`;
  });
  return `${p.name}\n${formatMinutes(t)}\n\n${lines.join("\n")}\n\nBuilt with Hoops Index`;
}

export function PlanScreen({ id }: { id: string }) {
  const plans = plansStore.use();
  const plan = plans.find((p) => p.id === id);
  const nav = useNav();
  const app = useApp();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [picker, setPicker] = useState(false);
  const [menu, setMenu] = useState(false);

  if (!plan) {
    return (
      <Screen title="Practice">
        <div className="empty">
          <h3>Practice deleted</h3>
        </div>
      </Screen>
    );
  }

  const update = (items: PlanItem[]) => savePlan({ ...plan, items });
  const move = (i: number, dir: -1 | 1) => {
    const items = [...plan.items];
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    update(items);
  };
  const setMinutes = (key: string, m: number) => update(plan.items.map((it) => (it.key === key ? { ...it, minutes: m } : it)));
  const remove = (key: string) => update(plan.items.filter((it) => it.key !== key));
  const addBreak = () => update([...plan.items, { key: uid(), type: "break", label: "Water break", minutes: 2 }]);
  const total = planTotal(plan);

  const share = async () => {
    const text = planAsText(plan);
    setMenu(false);
    try {
      if (navigator.share) await navigator.share({ title: plan.name, text });
      else {
        await navigator.clipboard.writeText(text);
        toast("Copied to clipboard", "copy");
      }
    } catch {
      /* user cancelled */
    }
  };

  const reshuffle = () => {
    setMenu(false);
    const focus = [...new Set(plan.items.flatMap((it) => (it.type === "drill" ? [getDrill(it.drillId)?.focus] : [])))].filter(
      (f): f is Focus => !!f && !["Warm-Up", "Team Concepts", "Conditioning"].includes(f),
    );
    const items = generatePlan({
      minutes: total || 60,
      players: plan.players ?? 10,
      ageGroup: plan.ageGroup ?? "U10–U12",
      skill: "Intermediate",
      focus: focus.slice(0, 3),
      conditioning: plan.items.some((it) => it.type === "drill" && getDrill(it.drillId)?.focus === "Conditioning"),
      waterBreaks: plan.items.some((it) => it.type === "break"),
    });
    update(items);
    toast("New drills, same plan", "shuffle");
  };

  let t = 0;
  return (
    <Screen
      title={plan.name}
      className="has-action-bar"
      hero={
        <div>
          <div className="kicker" style={{ marginBottom: 6 }}>Practice plan</div>
          <input className="name-input" value={plan.name} onChange={(e) => savePlan({ ...plan, name: e.target.value })} aria-label="Practice name" />
          <div className="hero-meta">
            {formatMinutes(total)} · {plan.items.filter((i) => i.type === "drill").length} drills
            {plan.players ? ` · ${plan.players} players` : ""}
            {plan.ageGroup ? ` · ${plan.ageGroup}` : ""}
          </div>
          {plan.items.length > 0 && <PlanTimeline plan={plan} onHero />}
        </div>
      }
      right={
        <>
          {plan.items.length > 0 && (
            <button className="nav-btn" onClick={() => setEditing((e) => !e)} style={editing ? { fontWeight: 600 } : undefined}>
              {editing ? "Done" : "Edit"}
            </button>
          )}
          <button className="nav-btn icon" onClick={() => setMenu(true)} aria-label="More">
            <Icon name="more" size={22} weight="bold" />
          </button>
        </>
      }
      footer={
        <div className="action-bar">
          <button className="btn primary" disabled={!plan.items.length} onClick={() => app.startPractice(plan.id)}>
            <Icon name="play" size={20} weight="fill" /> Start practice
          </button>
        </div>
      }
    >
      {plan.items.length > 0 ? (
        <>
          <div className="section-header">
            <span>Schedule</span>
          </div>
          <div className="group">
            {plan.items.map((it, i) => {
              const start = t;
              t += it.minutes;
              const d = it.type === "drill" ? getDrill(it.drillId) : undefined;
              return (
                <div className="plan-item" key={it.key}>
                  {editing && (
                    <div className="reorder">
                      <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                        <Icon name="up" size={18} weight="bold" />
                      </button>
                      <button onClick={() => move(i, 1)} disabled={i === plan.items.length - 1} aria-label="Move down">
                        <Icon name="down" size={18} weight="bold" />
                      </button>
                    </div>
                  )}
                  {d ? (
                    <FocusBadge focus={d.focus} />
                  ) : (
                    <div className="brk-badge">
                      <Icon name="drop" size={22} weight="duotone" />
                    </div>
                  )}
                  <button className="row-main" style={{ textAlign: "left", minWidth: 0 }} onClick={() => d && !editing && nav.push({ name: "drill", id: d.id })}>
                    <div className="time">
                      {clock(start)} – {clock(t)}
                    </div>
                    <div className="row-title" style={{ fontSize: 16 }}>
                      {d?.name ?? (it.type === "break" ? it.label : "Missing drill")}
                    </div>
                  </button>
                  {editing ? (
                    <button className="remove-btn" onClick={() => remove(it.key)} aria-label="Remove">
                      <Icon name="trash" size={20} />
                    </button>
                  ) : (
                    <Stepper value={it.minutes} min={1} max={45} onChange={(m) => setMinutes(it.key, m)} format={(v) => `${v}m`} />
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="empty" style={{ paddingBottom: 12 }}>
          <Icon name="clipboard" size={52} weight="duotone" />
          <h3>Empty practice</h3>
          <p>Add drills from the library and they’ll show up here in order.</p>
        </div>
      )}

      <div className="btn-row" style={{ marginTop: 16 }}>
        <button className="btn secondary" onClick={() => setPicker(true)}>
          <Icon name="plus" size={20} weight="bold" /> Add drill
        </button>
        <button className="btn plain" onClick={addBreak}>
          <Icon name="drop" size={20} weight="duotone" /> Break
        </button>
      </div>

      <DrillPicker open={picker} onClose={() => setPicker(false)} plan={plan} onAdd={(drillId, minutes) => update([...plan.items, { key: uid(), type: "drill", drillId, minutes }])} />

      <Sheet open={menu} onClose={() => setMenu(false)} title={plan.name}>
        <div style={{ height: 8 }} />
        <div className="group">
          <button className="row" onClick={share}>
            <span className="row-icon"><Icon name="share" size={20} weight="duotone" /></span>
            <div className="row-main">Share or copy as text</div>
          </button>
          <button className="row" onClick={reshuffle}>
            <span className="row-icon"><Icon name="shuffle" size={20} weight="duotone" /></span>
            <div className="row-main">
              <div>Shuffle drills</div>
              <div className="row-sub">Rebuild with fresh drills, same focus and length</div>
            </div>
          </button>
          <button
            className="row"
           
            onClick={() => {
              const id = uid();
              savePlan({ ...plan, id, name: `${plan.name} (copy)`, createdAt: Date.now(), items: plan.items.map((it) => ({ ...it, key: uid() })) });
              setMenu(false);
              toast("Practice duplicated", "copy");
            }}
          >
            <span className="row-icon"><Icon name="copy" size={20} weight="duotone" /></span>
            <div className="row-main">Duplicate</div>
          </button>
        </div>
        <div style={{ height: 16 }} />
        <div className="group">
          <button
            className="row danger"
            onClick={() => {
              setMenu(false);
              nav.pop();
              setTimeout(() => deletePlan(plan.id), 320);
            }}
          >
            Delete practice
          </button>
        </div>
      </Sheet>
    </Screen>
  );
}

function DrillPicker({ open, onClose, plan, onAdd }: { open: boolean; onClose: () => void; plan: Plan; onAdd: (id: string | number, minutes: number) => void }) {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState<Focus | null>(null);
  const dq = useDeferredValue(q);
  const results = useMemo(
    () => filterDrills(DRILLS, { ...EMPTY_FILTERS, query: dq, focus: focus ? [focus] : [], players: plan.players ?? null, age: plan.ageGroup ?? null }),
    [dq, focus, plan.players, plan.ageGroup],
  );
  const inPlan = new Set(plan.items.flatMap((it) => (it.type === "drill" ? [String(it.drillId)] : [])));

  return (
    <Sheet open={open} onClose={onClose} title="Add drills" full right={<button className="nav-btn bold" onClick={onClose}>Done</button>}>
      <label className="search" style={{ margin: "6px 16px 12px", flex: "none" }}>
        <Icon name="search" size={19} weight="bold" />
        <input type="search" placeholder="Search drills" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="chips chrome">
        {FOCUS_AREAS.map((x) => (
          <button key={x} className={`chip${focus === x ? " on" : ""}`} onClick={() => setFocus(focus === x ? null : x)}>
            <Icon name={FOCUS_ICON[x]} size={18} weight={focus === x ? "fill" : "duotone"} />
            {x}
          </button>
        ))}
      </div>
      {(plan.players || plan.ageGroup) && (
        <div className="count-line">
          <span>
            Showing drills for {plan.players ? `${plan.players} players` : ""}
            {plan.players && plan.ageGroup ? ", " : ""}
            {plan.ageGroup ?? ""}
          </span>
        </div>
      )}
      <div className="card-list">
        {results.map((d) => {
          const added = inPlan.has(String(d.id));
          return (
            <DrillRow
              key={d.id}
              drill={d}
              onClick={() => onAdd(d.id, d.duration)}
              right={
                <span style={{ color: added ? "var(--success)" : "var(--accent)", flex: "none" }}>
                  <Icon name={added ? "checkCircle" : "plus"} size={26} weight={added ? "fill" : "bold"} />
                </span>
              }
            />
          );
        })}
      </div>
    </Sheet>
  );
}
