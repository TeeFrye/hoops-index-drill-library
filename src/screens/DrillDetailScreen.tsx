import { useEffect, useState } from "react";
import { getDrill } from "../data";
import { favoritesStore, markRecent, notesStore, plansStore, savePlan, toggleFavorite, uid, idKey } from "../store";
import { ageLabel, formatMinutes, playersLabel } from "../lib/drills";
import { Screen, Sheet, useToast } from "../components/ui";
import { FocusBadge, Icon } from "../components/Icon";
import { SkillPip } from "../components/DrillRow";
import { useApp } from "../appContext";
import type { Drill } from "../types";

export function DrillDetailScreen({ id }: { id: string | number }) {
  const drill = getDrill(id);
  const favs = favoritesStore.use();
  const notes = notesStore.use();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (drill) markRecent(drill.id);
  }, [drill]);

  if (!drill) return <Screen title="Drill">Drill not found.</Screen>;
  const k = idKey(drill.id);
  const isFav = favs.includes(k);

  return (
    <Screen
      title={drill.name}
      className="has-action-bar"
      hero={
        <div className="drill-hero">
          <div className="top">
            <FocusBadge focus={drill.focus} large inverse />
            <div className="kicker">{drill.focus}</div>
          </div>
          <h1>{drill.name}</h1>
          <div className="tags-row">
            <span className="hero-pill">
              <Icon name="timer" size={14} weight="bold" /> {drill.duration} min
            </span>
            <span className="hero-pill">{drill.skill}</span>
            {drill.competitive && (
              <span className="hero-pill">
                <Icon name="trophy" size={14} weight="fill" /> Competitive
              </span>
            )}
          </div>
        </div>
      }
      right={
        <button
          className="nav-btn icon"
          aria-label={isFav ? "Remove from saved" : "Save drill"}
          onClick={() => {
            toggleFavorite(drill.id);
            toast(isFav ? "Removed from Saved" : "Saved", isFav ? "x" : "star");
          }}
        >
          <Icon name="star" size={22} weight={isFav ? "fill" : "bold"} style={isFav ? { color: "#ffc93c" } : undefined} />
        </button>
      }
      footer={
        <div className="action-bar">
          <button className="btn primary" onClick={() => setAddOpen(true)}>
            <Icon name="plus" size={20} weight="bold" /> Add to practice
          </button>
        </div>
      }
    >
      <div>
        <div className="stats">
          <div className="stat">
            <div className="v">{drill.duration}</div>
            <div className="k">Minutes</div>
          </div>
          <div className="stat">
            <div className="v">{playersLabel(drill)}</div>
            <div className="k">Players</div>
          </div>
          <div className="stat">
            <div className="v sm">{ageLabel(drill)}</div>
            <div className="k">Ages</div>
          </div>
          <div className="stat">
            <div className="v sm" style={{ display: "flex", justifyContent: "center" }}>
              <SkillPip skill={drill.skill} />
            </div>
            <div className="k">{drill.skill}</div>
          </div>
        </div>

        {drill.equipment && drill.equipment.length > 0 && (
          <>
            <div className="section-header">Equipment</div>
            <div className="card tags">
              {drill.equipment.map((e) => (
                <span className="tag" key={e}>
                  {e}
                </span>
              ))}
            </div>
          </>
        )}

        <div className="section-header">Setup</div>
        <div className="card">{drill.setup}</div>

        <div className="section-header">How to run it</div>
        <div className="card">
          <ol className="steps">
            {drill.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        {drill.cues.length > 0 && (
          <>
            <div className="section-header">Coaching cues</div>
            <div className="card">
              <ul className="bullets">
                {drill.cues.map((s, i) => (
                  <li key={i}>
                    <Icon name="bolt" size={18} weight="fill" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {drill.variations.length > 0 && (
          <>
            <div className="section-header">Variations</div>
            <div className="card">
              <ul className="bullets">
                {drill.variations.map((s, i) => (
                  <li key={i}>
                    <Icon name="shuffle" size={18} weight="bold" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="section-header">My notes</div>
        <div className="card">
          <textarea
            className="notes"
            placeholder="What worked, what to change, which kids need extra reps…"
            value={notes[k] ?? ""}
            onChange={(e) => notesStore.set((n) => ({ ...n, [k]: e.target.value }))}
          />
        </div>
      </div>
      <AddToPlanSheet open={addOpen} onClose={() => setAddOpen(false)} drill={drill} />
    </Screen>
  );
}

function AddToPlanSheet({ open, onClose, drill }: { open: boolean; onClose: () => void; drill: Drill }) {
  const plans = plansStore.use();
  const toast = useToast();
  const app = useApp();

  const addTo = (planId: string) => {
    const p = plans.find((x) => x.id === planId);
    if (!p) return;
    savePlan({ ...p, items: [...p.items, { key: uid(), type: "drill", drillId: drill.id, minutes: drill.duration }] });
    onClose();
    toast(`Added to ${p.name}`, "check");
  };

  const createNew = () => {
    const id = uid();
    savePlan({ id, name: "New practice", createdAt: Date.now(), updatedAt: Date.now(), items: [{ key: uid(), type: "drill", drillId: drill.id, minutes: drill.duration }] });
    onClose();
    setTimeout(() => app.goTo("plans", { name: "plan", id }), 250);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Add to practice" right={<button className="nav-btn" onClick={onClose}>Cancel</button>}>
      <div style={{ height: 8 }} />
      <div className="group">
        <button className="row" onClick={createNew} style={{ color: "var(--accent)" }}>
          <span className="row-icon"><Icon name="plus" size={20} weight="bold" /></span>
          <div className="row-main" style={{ fontWeight: 600 }}>
            New practice with this drill
          </div>
        </button>
      </div>
      {plans.length > 0 && <div className="section-header">Your practices</div>}
      {plans.length > 0 && (
        <div className="group">
          {plans.map((p) => {
            const total = p.items.reduce((a, b) => a + b.minutes, 0);
            const already = p.items.some((it) => it.type === "drill" && String(it.drillId) === String(drill.id));
            return (
              <button className="row" key={p.id} onClick={() => addTo(p.id)}>
                <span className="row-icon"><Icon name="clipboard" size={20} weight="duotone" /></span>
                <div className="row-main">
                  <div className="row-title">{p.name}</div>
                  <div className="row-sub">
                    {p.items.filter((i) => i.type === "drill").length} drills · {formatMinutes(total)}
                    {already ? " · already included" : ""}
                  </div>
                </div>
                <Icon name="plus" size={20} style={{ color: "var(--accent)" }} />
              </button>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}
