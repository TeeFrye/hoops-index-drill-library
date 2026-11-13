import type { Drill } from "../types";
import { SKILLS } from "../types";
import { FocusBadge, Icon } from "./Icon";
import { ageLabel, playersLabel } from "../lib/drills";

export function SkillPip({ skill }: { skill: Drill["skill"] }) {
  const n = SKILLS.indexOf(skill) + 1;
  return (
    <span className="skill-pip" title={skill} aria-label={skill}>
      {[1, 2, 3].map((i) => (
        <i key={i} className={i <= n ? "on" : ""} style={{ height: 5 + i * 2.5, alignSelf: "flex-end" }} />
      ))}
    </span>
  );
}

export function DrillRow({ drill, onClick, fav, right, minutes }: { drill: Drill; onClick?: () => void; fav?: boolean; right?: React.ReactNode; minutes?: number }) {
  return (
    <button className="row" onClick={onClick} style={{ "--inset": "68px" } as React.CSSProperties}>
      <FocusBadge focus={drill.focus} />
      <div className="row-main">
        <div className="row-title">{drill.name}</div>
        <div className="meta">
          <span>
            <Icon name="clock" size={13} stroke={2.2} />
            {minutes ?? drill.duration} min
          </span>
          <span>
            <Icon name="users" size={13} stroke={2.2} />
            {playersLabel(drill)}
          </span>
          <span>{ageLabel(drill)}</span>
          <span>
            <SkillPip skill={drill.skill} />
          </span>
        </div>
      </div>
      {fav && <Icon name="star" size={16} fill className="fav-star" />}
      {right ?? <Icon name="chev" size={18} className="chev" stroke={2.4} />}
    </button>
  );
}
