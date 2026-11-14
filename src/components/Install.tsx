import { useState, type ReactNode } from "react";
import { promptInstall, useInstallMode, type InstallMode } from "../lib/install";
import { Sheet, useToast } from "./ui";
import { Icon } from "./Icon";

const APP_ICON = `${import.meta.env.BASE_URL}apple-touch-icon-180x180.png`;
const DISMISS_KEY = "hi.installCard";

/**
 * One install action for every platform: opens the native dialog where the
 * browser supports it, otherwise the step-by-step sheet.
 */
export function useInstall(): { mode: InstallMode; install: () => void; sheet: ReactNode } {
  const mode = useInstallMode();
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const install = async () => {
    if (mode === "prompt") {
      if (await promptInstall()) toast("Installed. Find it on your home screen", "check");
    } else setOpen(true);
  };

  return { mode, install, sheet: <InstallSheet open={open} onClose={() => setOpen(false)} mode={mode} /> };
}

/** Promo card on the Drills screen. Hidden once installed or dismissed. */
export function InstallCard() {
  const { mode, install, sheet } = useInstall();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "dismissed";
    } catch {
      return false;
    }
  });
  if (mode === "installed" || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "dismissed");
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <div className="install-card">
        <img src={APP_ICON} alt="" width={52} height={52} className="install-card-icon" />
        <div className="install-card-text">
          <div className="install-card-title">Get the app</div>
          <div className="install-card-sub">Free · works offline · no account</div>
        </div>
        <button className="install-card-btn" onClick={install}>
          {mode === "prompt" ? "Install" : "How to"}
        </button>
        <button className="install-card-close" onClick={dismiss} aria-label="Dismiss">
          <Icon name="x" size={16} weight="bold" />
        </button>
      </div>
      {sheet}
    </>
  );
}

function Step({ n, icon, children }: { n: number; icon?: Parameters<typeof Icon>[0]["name"]; children: ReactNode }) {
  return (
    <li className="install-step">
      <span className="install-step-n">{n}</span>
      <span className="install-step-text">{children}</span>
      {icon && (
        <span className="row-icon">
          <Icon name={icon} size={20} weight="bold" />
        </span>
      )}
    </li>
  );
}

function InstallSheet({ open, onClose, mode }: { open: boolean; onClose: () => void; mode: InstallMode }) {
  const ios = mode === "ios";
  return (
    <Sheet open={open} onClose={onClose} title="Install the app" right={<button className="nav-btn bold" onClick={onClose}>Done</button>}>
      <div className="install-hero">
        <img src={APP_ICON} alt="" width={76} height={76} className="install-card-icon" />
        <div>
          <div className="install-hero-title">Hoops Index</div>
          <div className="install-hero-sub">Opens full-screen from your home screen and works in the gym with no signal.</div>
        </div>
      </div>

      {ios ? (
        <>
          <div className="field-label">On iPhone or iPad</div>
          <ol className="group install-steps">
            <Step n={1} icon="share">
              Tap the <b>Share</b> button in Safari’s toolbar
            </Step>
            <Step n={2} icon="addHome">
              Scroll down and tap <b>Add to Home Screen</b>
            </Step>
            <Step n={3} icon="check">
              Tap <b>Add</b>, then open Hoops Index from your home screen
            </Step>
          </ol>
          <p className="footnote">
            Don’t see “Add to Home Screen”? Tap <b>Edit Actions</b> at the bottom of the share menu to add it. Using Chrome on iPhone? The same option is under Share.
          </p>
        </>
      ) : (
        <>
          <div className="field-label">On Android (Chrome)</div>
          <ol className="group install-steps">
            <Step n={1} icon="more">
              Tap the <b>⋮</b> menu in the top corner
            </Step>
            <Step n={2} icon="addHome">
              Tap <b>Install app</b> or <b>Add to Home screen</b>
            </Step>
          </ol>
          <div className="field-label">On a computer (Chrome or Edge)</div>
          <ol className="group install-steps">
            <Step n={1} icon="download">
              Click the <b>install icon</b> at the right end of the address bar
            </Step>
            <Step n={2} icon="check">
              Click <b>Install</b>. It opens in its own window
            </Step>
          </ol>
          <p className="footnote">Using Firefox or another browser? Open this page in Chrome, Edge or Safari to install it.</p>
        </>
      )}

      <div className="field-label">Why install?</div>
      <div className="group">
        <div className="row">
          <span className="row-icon">
            <Icon name="offline" size={20} weight="duotone" />
          </span>
          <div className="row-main">Works with no signal</div>
        </div>
        <div className="row">
          <span className="row-icon">
            <Icon name="phone" size={20} weight="duotone" />
          </span>
          <div className="row-main">Full-screen, no browser bars</div>
        </div>
        <div className="row">
          <span className="row-icon">
            <Icon name="star" size={20} weight="duotone" />
          </span>
          <div className="row-main">Free, no account, nothing to sign up for</div>
        </div>
      </div>
    </Sheet>
  );
}
