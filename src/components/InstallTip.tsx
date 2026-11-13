import { useState } from "react";
import { Icon } from "./Icon";

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export function InstallTip() {
  const [hidden, setHidden] = useState(() => {
    try {
      return isStandalone() || !isIOS() || localStorage.getItem("hi.installTip") === "dismissed";
    } catch {
      return isStandalone() || !isIOS();
    }
  });
  if (hidden) return null;
  return (
    <div className="install-tip">
      <span className="row-icon"><Icon name="share" size={20} weight="duotone" /></span>
      <div style={{ flex: 1 }}>
        <b>Install the app:</b> tap Share, then <b>Add to Home Screen</b>. Works offline in the gym.
      </div>
      <button
        aria-label="Dismiss"
        onClick={() => {
          setHidden(true);
          try {
            localStorage.setItem("hi.installTip", "dismissed");
          } catch {
            /* ignore */
          }
        }}
        style={{ color: "var(--label-3)" }}
      >
        <Icon name="x" size={18} weight="bold" />
      </button>
    </div>
  );
}
