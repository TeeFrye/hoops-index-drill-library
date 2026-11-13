import type { Focus } from "../types";

const P: Record<string, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  xCircle: <><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" /><path d="m15 9-6 6m0-6 6 6" stroke="var(--bg-elev)" /></>,
  back: <path d="m15 18-6-6 6-6" />,
  chev: <path d="m9 18 6-6-6-6" />,
  star: <path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.3l-5.6 2.9 1.1-6.3L2.9 9.4l6.3-.9z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  sliders: <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>,
  play: <path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor" />,
  pause: <><rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" /><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" /></>,
  next: <><path d="M5 5v14l10-7z" fill="currentColor" /><path d="M19 5v14" /></>,
  prev: <><path d="M19 5v14L9 12z" fill="currentColor" /><path d="M5 5v14" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /><path d="M10 11v6M14 11v6" /></>,
  ball: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3v18M5.6 5.6c2.3 1.7 3.6 4 3.6 6.4s-1.3 4.7-3.6 6.4M18.4 5.6c-2.3 1.7-3.6 4-3.6 6.4s1.3 4.7 3.6 6.4" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" /></>,
  bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  drop: <path d="M12 2.7s6 6.4 6 11.3a6 6 0 0 1-12 0c0-4.9 6-11.3 6-11.3z" />,
  shuffle: <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />,
  up: <path d="m18 15-6-6-6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  share: <><path d="M12 3v13M7 8l5-5 5 5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></>,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  flame: <path d="M12 22c4 0 7-2.7 7-7 0-3.5-2.2-5.6-3.5-7.5-.4 1.9-1.4 3-2.5 3.5.3-3.4-1.4-6.6-4-9 0 4-4 6.5-4 12 0 4.3 3 8 7 8z" />,
  arrows: <path d="M3 12h15M14 7l5 5-5 5M3 6h6M3 18h6" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>,
  hoop: <><path d="M4 4h16v8H4z" /><path d="M9 12v1M15 12v1M8 13h8l-1.5 7h-5z" /></>,
  foot: <><path d="M8 3c2 0 3 2 3 5s-1 5-1 7-1 3-2.5 3S5 17 5 15s-.5-4-.5-6S6 3 8 3z" /><path d="M16 9c2 0 3.5 2 3.5 4s-.5 3-.5 4.5-1 2.5-2.5 2.5-2.5-1-2.5-2.5.5-3 .5-5 0-3.5 1.5-3.5z" /></>,
  shield: <path d="M12 2 4 5v6c0 5 3.5 9.4 8 11 4.5-1.6 8-6 8-11V5z" />,
  rebound: <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></>,
  team: <><circle cx="6" cy="8" r="2.5" /><circle cx="18" cy="8" r="2.5" /><circle cx="12" cy="16" r="2.5" /><path d="M8 9.5 10.5 14M16 9.5 13.5 14M8.5 8h7" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z" />,
  note: <><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></>,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
  download: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M5 21h14" /></>,
  upload: <><path d="M12 15V3M7 8l5-5 5 5" /><path d="M5 21h14" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  volume: <><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h0" /></>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></>,
  cone: <><path d="M12 3 7 19h10z" /><path d="M4 21h16M9 12h6" /></>,
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 22, stroke = 2, fill = false, className, style }: { name: IconName; size?: number; stroke?: number; fill?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {P[name]}
    </svg>
  );
}

export const FOCUS_META: Record<Focus, { color: string; icon: IconName }> = {
  "Warm-Up": { color: "#F59E0B", icon: "flame" },
  "Ball Handling": { color: "#F2610F", icon: "ball" },
  Passing: { color: "#0A84FF", icon: "arrows" },
  Shooting: { color: "#30B158", icon: "target" },
  Finishing: { color: "#14B8A6", icon: "hoop" },
  Footwork: { color: "#AF52DE", icon: "foot" },
  Defense: { color: "#E5352B", icon: "shield" },
  Rebounding: { color: "#8E6E53", icon: "rebound" },
  "Team Concepts": { color: "#5856D6", icon: "team" },
  Conditioning: { color: "#FF2D55", icon: "heart" },
};

export function FocusBadge({ focus, large }: { focus: Focus; large?: boolean }) {
  const m = FOCUS_META[focus] ?? FOCUS_META["Team Concepts"];
  return (
    <div className={`focus-badge${large ? " lg" : ""}`} style={{ "--c": m.color } as React.CSSProperties}>
      <Icon name={m.icon} size={large ? 28 : 21} stroke={2.1} />
    </div>
  );
}
