/**
 * When launched from the iPhone home screen, iOS can report a viewport that is
 * shorter than the physical screen, leaving a strip of page background below
 * the app. In standalone mode the app always owns the whole screen, so size it
 * to the real screen height instead. In a normal browser tab we leave the
 * default (100%) alone so Safari's toolbar never covers the tab bar.
 */
export function fitToScreen() {
  const root = document.documentElement;
  const isStandalone = () =>
    window.matchMedia?.("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;

  const update = () => {
    if (!isStandalone()) {
      root.style.removeProperty("--app-h");
      return;
    }
    const portrait = window.innerHeight >= window.innerWidth;
    const screenH = portrait ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
    root.style.setProperty("--app-h", `${Math.max(window.innerHeight, screenH)}px`);
  };

  update();
  window.addEventListener("resize", update);
  window.addEventListener("orientationchange", () => setTimeout(update, 250));
}
