import { ArrowFatLinesUp } from "@phosphor-icons/react/dist/csr/ArrowFatLinesUp";
import { ArrowsLeftRight } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { Basketball } from "@phosphor-icons/react/dist/csr/Basketball";
import { CaretDown } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretLeft } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRight } from "@phosphor-icons/react/dist/csr/CaretRight";
import { CaretUp } from "@phosphor-icons/react/dist/csr/CaretUp";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { CheckCircle } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClipboardText } from "@phosphor-icons/react/dist/csr/ClipboardText";
import { Clock } from "@phosphor-icons/react/dist/csr/Clock";
import { ClockCounterClockwise } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { Copy } from "@phosphor-icons/react/dist/csr/Copy";
import { DeviceMobile } from "@phosphor-icons/react/dist/csr/DeviceMobile";
import { DotsThree } from "@phosphor-icons/react/dist/csr/DotsThree";
import { DownloadSimple } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { Drop } from "@phosphor-icons/react/dist/csr/Drop";
import { Export } from "@phosphor-icons/react/dist/csr/Export";
import { Fire } from "@phosphor-icons/react/dist/csr/Fire";
import { GearSix } from "@phosphor-icons/react/dist/csr/GearSix";
import { HandGrabbing } from "@phosphor-icons/react/dist/csr/HandGrabbing";
import { Heartbeat } from "@phosphor-icons/react/dist/csr/Heartbeat";
import { Info } from "@phosphor-icons/react/dist/csr/Info";
import { Lightning } from "@phosphor-icons/react/dist/csr/Lightning";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { Minus } from "@phosphor-icons/react/dist/csr/Minus";
import { NotePencil } from "@phosphor-icons/react/dist/csr/NotePencil";
import { Pause } from "@phosphor-icons/react/dist/csr/Pause";
import { PencilSimple } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { Play } from "@phosphor-icons/react/dist/csr/Play";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";
import { ShieldChevron } from "@phosphor-icons/react/dist/csr/ShieldChevron";
import { Shuffle } from "@phosphor-icons/react/dist/csr/Shuffle";
import { SkipBack } from "@phosphor-icons/react/dist/csr/SkipBack";
import { SkipForward } from "@phosphor-icons/react/dist/csr/SkipForward";
import { SlidersHorizontal } from "@phosphor-icons/react/dist/csr/SlidersHorizontal";
import { Sneaker } from "@phosphor-icons/react/dist/csr/Sneaker";
import { Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle";
import { SpeakerHigh } from "@phosphor-icons/react/dist/csr/SpeakerHigh";
import { Star } from "@phosphor-icons/react/dist/csr/Star";
import { Sun } from "@phosphor-icons/react/dist/csr/Sun";
import { Target } from "@phosphor-icons/react/dist/csr/Target";
import { Timer } from "@phosphor-icons/react/dist/csr/Timer";
import { TrafficCone } from "@phosphor-icons/react/dist/csr/TrafficCone";
import { Trash } from "@phosphor-icons/react/dist/csr/Trash";
import { Trophy } from "@phosphor-icons/react/dist/csr/Trophy";
import { UploadSimple } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { UsersFour } from "@phosphor-icons/react/dist/csr/UsersFour";
import { UsersThree } from "@phosphor-icons/react/dist/csr/UsersThree";
import { X } from "@phosphor-icons/react/dist/csr/X";
import { XCircle } from "@phosphor-icons/react/dist/csr/XCircle";
import type { Icon as PhosphorIcon, IconWeight } from "@phosphor-icons/react";
import type { Focus } from "../types";

const ICONS = {
  search: MagnifyingGlass,
  x: X,
  xCircle: XCircle,
  back: CaretLeft,
  chev: CaretRight,
  up: CaretUp,
  down: CaretDown,
  star: Star,
  plus: Plus,
  minus: Minus,
  clock: Clock,
  timer: Timer,
  users: UsersThree,
  sliders: SlidersHorizontal,
  play: Play,
  pause: Pause,
  next: SkipForward,
  prev: SkipBack,
  trash: Trash,
  ball: Basketball,
  clipboard: ClipboardText,
  gear: GearSix,
  check: Check,
  checkCircle: CheckCircle,
  drop: Drop,
  shuffle: Shuffle,
  share: Export,
  bolt: Lightning,
  flame: Fire,
  arrows: ArrowsLeftRight,
  target: Target,
  rim: ArrowFatLinesUp,
  sneaker: Sneaker,
  shield: ShieldChevron,
  grab: HandGrabbing,
  team: UsersFour,
  heart: Heartbeat,
  note: NotePencil,
  sparkle: Sparkle,
  download: DownloadSimple,
  upload: UploadSimple,
  sun: Sun,
  volume: SpeakerHigh,
  info: Info,
  phone: DeviceMobile,
  history: ClockCounterClockwise,
  edit: PencilSimple,
  copy: Copy,
  cone: TrafficCone,
  more: DotsThree,
  trophy: Trophy,
} satisfies Record<string, PhosphorIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 22,
  weight,
  fill = false,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  weight?: IconWeight;
  /** Shorthand for weight="fill". */
  fill?: boolean;
  /** Legacy prop from the hand-drawn set: ≥2.3 maps to bold. */
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const C = ICONS[name];
  return <C size={size} weight={fill ? "fill" : (weight ?? "regular")} className={className} style={{ flex: "none", ...style }} aria-hidden="true" />;
}

export const FOCUS_ICON: Record<Focus, IconName> = {
  "Warm-Up": "flame",
  "Ball Handling": "ball",
  Passing: "arrows",
  Shooting: "target",
  Finishing: "rim",
  Footwork: "sneaker",
  Defense: "shield",
  Rebounding: "grab",
  "Team Concepts": "team",
  Conditioning: "heart",
};

/** Kept for callers that colour things by focus — the brand uses one crimson throughout. */
export const FOCUS_META: Record<Focus, { color: string; icon: IconName }> = Object.fromEntries(
  Object.entries(FOCUS_ICON).map(([f, icon]) => [f, { color: "var(--accent)", icon }]),
) as Record<Focus, { color: string; icon: IconName }>;

export function FocusBadge({ focus, large, inverse }: { focus: Focus; large?: boolean; inverse?: boolean }) {
  return (
    <div className={`focus-badge${large ? " lg" : ""}${inverse ? " inverse" : ""}`}>
      <Icon name={FOCUS_ICON[focus] ?? "ball"} size={large ? 30 : 23} weight="duotone" />
    </div>
  );
}
