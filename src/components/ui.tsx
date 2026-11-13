import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

/* ---------------- Navigation ---------------- */

export type Route =
  | { name: "drills" }
  | { name: "drill"; id: string | number }
  | { name: "plans" }
  | { name: "plan"; id: string }
  | { name: "saved" }
  | { name: "settings" };

export interface Nav {
  push: (r: Route) => void;
  pop: () => void;
  depth: number;
}
export const NavContext = createContext<Nav>({ push: () => {}, pop: () => {}, depth: 0 });
export const useNav = () => useContext(NavContext);

/* ---------------- Screen with large-title nav bar ---------------- */

interface ScreenProps {
  title: string;
  /** Show the big display title inside the crimson hero. */
  large?: boolean;
  subtitle?: ReactNode;
  /** Custom hero content (replaces the large title), e.g. a drill's name block. */
  hero?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Content directly under the hero, before the main content. */
  header?: ReactNode;
}

export function Screen({ title, large, subtitle, hero, left, right, children, footer, className = "", header }: ScreenProps) {
  const nav = useNav();
  const [solid, setSolid] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    const h = heroRef.current?.offsetHeight ?? 100;
    const next = y > h - 70;
    if (next !== solid) setSolid(next);
  };
  const leftNode =
    left ??
    (nav.depth > 0 ? (
      <button className="nav-btn" onClick={nav.pop} aria-label="Back">
        <Icon name="back" size={24} weight="bold" />
      </button>
    ) : null);

  return (
    <div className={`screen-inner ${className}`} style={{ display: "contents" }}>
      <header className={`navbar chrome${solid ? " solid" : ""}`}>
        <div className="navbar-row">
          <div className="navbar-left">{leftNode}</div>
          <div className="navbar-title">{title}</div>
          <div className="navbar-right">{right}</div>
        </div>
      </header>
      <div className="scroll" onScroll={onScroll}>
        <div className="hero-band" ref={heroRef}>
          {hero ?? (
            <>
              {large && <h1 className="display-title">{title}</h1>}
              {large && subtitle && <div className="display-sub">{subtitle}</div>}
            </>
          )}
        </div>
        <div className="stripe-band" aria-hidden="true" />
        {header}
        {children}
      </div>
      {footer}
    </div>
  );
}

/* ---------------- Hanging banners (focus areas) ---------------- */

export function Banner({ label, sub, icon, on, onClick, index = 0 }: { label: string; sub?: string; icon: Parameters<typeof Icon>[0]["name"]; on?: boolean; onClick?: () => void; index?: number }) {
  return (
    <button className={`banner${on ? " on" : ""}`} onClick={onClick} aria-pressed={on} style={{ animationDelay: `${index * 40}ms` }}>
      <span className="banner-cords" aria-hidden="true" />
      <svg className="banner-shape" viewBox="0 0 96 128" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id="candy" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="8" className="banner-stripe-a" />
            <rect x="4" width="4" height="8" className="banner-stripe-b" />
          </pattern>
        </defs>
        <path d="M0 0H96V128L48 112L0 128Z" className="banner-fill" />
        <rect x="0" y="0" width="96" height="9" fill="url(#candy)" />
        <path d="M6 15H90V119L48 105L6 119Z" className="banner-line" />
      </svg>
      <span className="banner-content">
        <Icon name={icon} size={26} weight={on ? "fill" : "duotone"} />
        <span className="banner-label">{label}</span>
        {sub && <span className="banner-sub">{sub}</span>}
      </span>
    </button>
  );
}

/* ---------------- Bottom sheet ---------------- */

export function Sheet({
  open,
  onClose,
  title,
  left,
  right,
  full,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  full?: boolean;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y0: number; dy: number } | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  // Drag-to-dismiss from the grabber / header area.
  const onTouchStart = (e: React.TouchEvent) => {
    drag.current = { y0: e.touches[0].clientY, dy: 0 };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!drag.current || !sheetRef.current) return;
    const dy = Math.max(0, e.touches[0].clientY - drag.current.y0);
    drag.current.dy = dy;
    sheetRef.current.style.animation = "none";
    sheetRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onTouchEnd = () => {
    const el = sheetRef.current;
    if (!drag.current || !el) return;
    const { dy } = drag.current;
    drag.current = null;
    el.style.transition = "transform 0.25s cubic-bezier(.2,.9,.25,1)";
    if (dy > 110) {
      el.style.transform = "translateY(100%)";
      setTimeout(onClose, 200);
    } else {
      el.style.transform = "";
      setTimeout(() => el && (el.style.transition = ""), 260);
    }
  };

  return createPortal(
    <>
      <div className={`sheet-backdrop${closing ? " closing" : ""}`} onClick={onClose} />
      <div ref={sheetRef} className={`sheet${full ? " full" : ""}${closing ? " closing" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} className="chrome">
          <div className="sheet-grabber" />
          <div className="sheet-head">
            <div style={{ display: "flex" }}>{left}</div>
            <h2>{title}</h2>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>{right}</div>
          </div>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </>,
    document.querySelector(".app") ?? document.body,
  );
}

/* ---------------- Controls ---------------- */

export function Segmented<T extends string>({ options, value, onChange, labels }: { options: readonly T[]; value: T; onChange: (v: T) => void; labels?: Partial<Record<T, string>> }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button key={o} role="tab" aria-selected={o === value} className={o === value ? "on" : ""} onClick={() => onChange(o)}>
          {labels?.[o] ?? o}
        </button>
      ))}
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 999, step = 1, format }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; format?: (v: number) => string }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min} aria-label="Decrease">
        <Icon name="minus" size={18} stroke={2.4} />
      </button>
      <span className="sep" />
      <span className="val">{format ? format(value) : value}</span>
      <span className="sep" />
      <button onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max} aria-label="Increase">
        <Icon name="plus" size={18} stroke={2.4} />
      </button>
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button role="switch" aria-checked={on} aria-label={label} className={`toggle${on ? " on" : ""}`} onClick={() => onChange(!on)} />;
}

/* ---------------- Toast ---------------- */

type ToastFn = (msg: string, icon?: Parameters<typeof Icon>[0]["name"]) => void;
export const ToastContext = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastHost({ children }: { children: ReactNode }) {
  const [t, setT] = useState<{ id: number; msg: string; icon?: Parameters<typeof Icon>[0]["name"] } | null>(null);
  const show = useCallback<ToastFn>((msg, icon) => setT({ id: Date.now(), msg, icon }), []);
  useEffect(() => {
    if (!t) return;
    const h = setTimeout(() => setT(null), 2200);
    return () => clearTimeout(h);
  }, [t]);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {t && (
        <div className="toast" key={t.id} role="status">
          {t.icon && <Icon name={t.icon} size={18} stroke={2.4} />}
          {t.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}
