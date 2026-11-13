import { useRef } from "react";
import { DRILLS } from "../data";
import { AGE_GROUPS, type ThemePref } from "../types";
import { exportData, importData, resetAll, settingsStore } from "../store";
import { Screen, Segmented, Stepper, Toggle, useToast } from "../components/ui";
import { Icon } from "../components/Icon";

const THEMES = ["system", "light", "dark"] as const;

export function SettingsScreen() {
  const s = settingsStore.use();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<typeof s>) => settingsStore.set((p) => ({ ...p, ...patch }));

  const download = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hoops-index-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      importData(await f.text());
      toast("Backup restored", "check");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't read that file", "x");
    }
  };

  return (
    <Screen title="Settings" large>
      <div className="section-header">My team</div>
      <div className="group">
        <div className="row">
          <Icon name="users" size={20} style={{ color: "var(--accent)" }} />
          <div className="row-main">Usual roster</div>
          <Stepper value={s.players} min={1} max={30} onChange={(v) => set({ players: v })} />
        </div>
        <div className="row" style={{ display: "block", "--inset": "16px" } as React.CSSProperties}>
          <div style={{ marginBottom: 10 }}>Age group</div>
          <Segmented options={AGE_GROUPS} value={s.ageGroup} onChange={(v) => set({ ageGroup: v })} labels={{ "U8–U10": "U8–10", "U10–U12": "U10–12", "U12–U14": "U12–14" }} />
        </div>
      </div>
      <p className="footnote">Used as the starting point for filters and new practices.</p>

      <div className="section-header">Practice mode</div>
      <div className="group">
        <div className="row">
          <Icon name="volume" size={20} style={{ color: "var(--accent)" }} />
          <div className="row-main">
            <div>Whistle beeps</div>
            <div className="row-sub">Beep at 30 seconds left and when time’s up</div>
          </div>
          <Toggle label="Whistle beeps" on={s.sound} onChange={(v) => set({ sound: v })} />
        </div>
      </div>

      <div className="section-header">Appearance</div>
      <div className="field-pad">
        <Segmented<ThemePref> options={THEMES} value={s.theme} onChange={(v) => set({ theme: v })} labels={{ system: "Automatic", light: "Light", dark: "Dark" }} />
      </div>

      <div className="section-header">Your data</div>
      <div className="group">
        <button className="row" onClick={download}>
          <Icon name="download" size={20} style={{ color: "var(--accent)" }} />
          <div className="row-main">Back up practices & saved drills</div>
          <Icon name="chev" size={18} className="chev" stroke={2.4} />
        </button>
        <button className="row" style={{ "--inset": "48px" } as React.CSSProperties} onClick={() => fileRef.current?.click()}>
          <Icon name="upload" size={20} style={{ color: "var(--accent)" }} />
          <div className="row-main">Restore from backup</div>
          <Icon name="chev" size={18} className="chev" stroke={2.4} />
        </button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
      <p className="footnote">Everything stays on this device. No account needed. Back up before switching phones.</p>

      <div className="section-header">About</div>
      <div className="group">
        <div className="row">
          <div className="row-main">Drills in library</div>
          <div className="row-value">{DRILLS.length}</div>
        </div>
        <div className="row">
          <div className="row-main">Version</div>
          <div className="row-value">2.0</div>
        </div>
      </div>

      <div style={{ height: 24 }} />
      <div className="group">
        <button
          className="row danger"
          onClick={() => {
            if (confirm("Erase all practices, saved drills and notes on this device?")) {
              resetAll();
              toast("All data erased", "trash");
            }
          }}
        >
          Erase all data
        </button>
      </div>
    </Screen>
  );
}
