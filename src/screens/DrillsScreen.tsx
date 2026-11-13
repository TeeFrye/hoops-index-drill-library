import { useDeferredValue, useMemo, useState } from "react";
import { DRILLS } from "../data";
import { AGE_GROUPS, FOCUS_AREAS, SKILLS, type AgeGroup, type Focus, type Skill } from "../types";
import { EMPTY_FILTERS, activeFilterCount, filterDrills, type DrillFilters } from "../lib/drills";
import { favoritesStore, settingsStore } from "../store";
import { Screen, Segmented, Sheet, Stepper, Toggle, useNav } from "../components/ui";
import { FOCUS_META, Icon } from "../components/Icon";
import { DrillRow } from "../components/DrillRow";
import { InstallTip } from "../components/InstallTip";

export function DrillsScreen() {
  const nav = useNav();
  const favs = favoritesStore.use();
  const [f, setF] = useState<DrillFilters>(EMPTY_FILTERS);
  const [sheet, setSheet] = useState(false);
  const deferred = useDeferredValue(f);
  const results = useMemo(() => filterDrills(DRILLS, deferred), [deferred]);
  const nActive = activeFilterCount(f);

  const toggleFocus = (x: Focus) => setF((p) => ({ ...p, focus: p.focus.includes(x) ? p.focus.filter((y) => y !== x) : [...p.focus, x] }));

  return (
    <Screen
      title="Drills"
      large
      subtitle={`${DRILLS.length} drills for youth coaches`}
      header={
        <>
          <InstallTip />
          <label className="search">
            <Icon name="search" size={18} stroke={2.4} />
            <input
              type="search"
              placeholder="Search drills, skills, cues"
              value={f.query}
              onChange={(e) => setF((p) => ({ ...p, query: e.target.value }))}
              enterKeyHint="search"
              autoCorrect="off"
            />
            {f.query && (
              <button className="search-clear" onClick={() => setF((p) => ({ ...p, query: "" }))} aria-label="Clear search">
                <Icon name="xCircle" size={18} />
              </button>
            )}
          </label>
          <div className="chips chrome">
            <button className={`chip${nActive ? " on" : ""}`} onClick={() => setSheet(true)}>
              <Icon name="sliders" size={16} stroke={2.2} /> Filters
              {nActive > 0 && <span className="badge">{nActive}</span>}
            </button>
            {FOCUS_AREAS.map((x) => (
              <button
                key={x}
                className={`chip${f.focus.includes(x) ? " on" : ""}`}
                style={{ "--chip-color": FOCUS_META[x].color } as React.CSSProperties}
                onClick={() => toggleFocus(x)}
              >
                <span className="dot" />
                {x}
              </button>
            ))}
          </div>
        </>
      }
    >
      <div className="count-line">
        <span>
          {results.length} {results.length === 1 ? "drill" : "drills"}
        </span>
        {(nActive > 0 || f.focus.length > 0 || f.query) && <button onClick={() => setF(EMPTY_FILTERS)}>Clear all</button>}
      </div>
      {results.length ? (
        <div className="group">
          {results.map((d) => (
            <DrillRow key={d.id} drill={d} fav={favs.includes(String(d.id))} onClick={() => nav.push({ name: "drill", id: d.id })} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Icon name="search" size={44} stroke={1.6} />
          <h3>No drills match</h3>
          <p>Try removing a filter or searching for something broader.</p>
          <button className="btn secondary" style={{ maxWidth: 200, margin: "16px auto 0" }} onClick={() => setF(EMPTY_FILTERS)}>
            Reset filters
          </button>
        </div>
      )}
      <FilterSheet open={sheet} onClose={() => setSheet(false)} value={f} onChange={setF} count={results.length} />
    </Screen>
  );
}

function FilterSheet({ open, onClose, value: f, onChange, count }: { open: boolean; onClose: () => void; value: DrillFilters; onChange: (f: DrillFilters) => void; count: number }) {
  const settings = settingsStore.use();
  const set = (patch: Partial<DrillFilters>) => onChange({ ...f, ...patch });
  const toggleSkill = (s: Skill) => set({ skill: f.skill.includes(s) ? f.skill.filter((x) => x !== s) : [...f.skill, s] });
  const ageOpts = ["Any", ...AGE_GROUPS] as const;
  const timeOpts = ["Any", "5", "10", "15"] as const;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filters"
      left={
        <button className="nav-btn" onClick={() => onChange({ ...EMPTY_FILTERS, query: f.query, focus: f.focus })}>
          Reset
        </button>
      }
      right={
        <button className="nav-btn bold" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="field-label">My team</div>
      <div className="field-pad">
        <button className="btn secondary" onClick={() => set({ players: settings.players, age: settings.ageGroup })}>
          <Icon name="users" size={18} /> Use my team · {settings.players} players · {settings.ageGroup}
        </button>
      </div>

      <div className="field-label">Players at practice</div>
      <div className="group">
        <div className="row">
          <div className="row-main">{f.players ? `${f.players} players` : "Any number"}</div>
          {f.players ? (
            <Stepper value={f.players} min={1} max={30} onChange={(v) => set({ players: v })} />
          ) : (
            <button className="nav-btn" onClick={() => set({ players: settings.players })}>
              Set
            </button>
          )}
        </div>
        {f.players != null && (
          <button className="row" style={{ color: "var(--accent)" }} onClick={() => set({ players: null })}>
            Any number of players
          </button>
        )}
      </div>

      <div className="field-label">Age group</div>
      <div className="field-pad">
        <Segmented options={ageOpts} value={(f.age ?? "Any") as (typeof ageOpts)[number]} onChange={(v) => set({ age: v === "Any" ? null : (v as AgeGroup) })} labels={{ "U8–U10": "U8–10", "U10–U12": "U10–12", "U12–U14": "U12–14" }} />
      </div>

      <div className="field-label">Skill level</div>
      <div className="wrap-chips">
        {SKILLS.map((s) => (
          <button key={s} className={`chip${f.skill.includes(s) ? " on" : ""}`} onClick={() => toggleSkill(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="field-label">Max length (minutes)</div>
      <div className="field-pad">
        <Segmented options={timeOpts} value={(f.maxMinutes ? String(f.maxMinutes) : "Any") as (typeof timeOpts)[number]} onChange={(v) => set({ maxMinutes: v === "Any" ? null : Number(v) })} />
      </div>

      <div className="field-label">Equipment</div>
      <div className="group">
        <div className="row">
          <div className="row-main">
            <div>Balls & hoop only</div>
            <div className="row-sub">Hide drills that need cones, pads or chairs</div>
          </div>
          <Toggle label="Balls and hoop only" on={f.noEquipment} onChange={(v) => set({ noEquipment: v })} />
        </div>
      </div>

      <div className="field-pad" style={{ marginTop: 24 }}>
        <button className="btn primary" onClick={onClose}>
          Show {count} {count === 1 ? "drill" : "drills"}
        </button>
      </div>
    </Sheet>
  );
}
