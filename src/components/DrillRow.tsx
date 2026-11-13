import type { Drill } from "../types";
import { SKILLS } from "../types";
import { FocusBadge, Icon } from "./Icon";
import { ageLabel, playersLabel } from "../lib/drills";

export function SkillPip({ skill }: { skill: Drill["skill"] }) {
  const n = SKILLS.indexOf(skill) + 1;
  return (
    <span className="skill-pip" title={skill} aria-label={skill}>
      {[1, 2, 3].map((i) => (
        <i key={i} className={i <= n ? "on" : ""} style={{ height: 5 + i * 3 }} />
      ))}
    </span>
  );
}

export function DrillRow({ drill, onClick, fav, right, minutes }: { drill: Drill; onClick?: () => void; fav?: boolean; right?: React.ReactNode; minutes?: number }) {
  return (
    <button className="drill-card" onClick={onClick}>
      <FocusBadge focus={drill.focus} />
      <div className="row-main">
        <div className="row-title">{drill.name}</div>
        <div className="meta">
          <span className="pill">
            <Icon name="timer" size={13} weight="bold" />
            {minutes ?? drill.duration}m
          </span>
          <span className="pill">
            <Icon name="users" size={13} weight="bold" />
            {playersLabel(drill)}
          </span>
          <span className="pill">{ageLabel(drill)}</span>
          <span className="pill lvl">
            <SkillPip skill={drill.skill} />
          </span>
        </div>
      </div>
      {fav && <Icon name="star" size={18} fill className="fav-star" />}
      {right ?? <Icon name="chev" size={18} weight="bold" className="chev" style={{ color: "var(--label-3)" }} />}
    </button>
  );
}
