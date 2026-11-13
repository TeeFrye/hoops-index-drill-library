import { useState } from "react";
import { getDrill } from "../data";
import { favoritesStore, notesStore, recentStore } from "../store";
import { Screen, Segmented, useNav } from "../components/ui";
import { Icon } from "../components/Icon";
import { DrillRow } from "../components/DrillRow";
import type { Drill } from "../types";

const VIEWS = ["Saved", "Recent", "Notes"] as const;

export function SavedScreen() {
  const nav = useNav();
  const favs = favoritesStore.use();
  const recent = recentStore.use();
  const notes = notesStore.use();
  const [view, setView] = useState<(typeof VIEWS)[number]>("Saved");

  const ids = view === "Saved" ? favs : view === "Recent" ? recent : Object.keys(notes).filter((k) => notes[k]?.trim());
  const drills = ids.map((id) => getDrill(id)).filter((d): d is Drill => !!d);

  const empty = {
    Saved: { icon: "star" as const, title: "No saved drills", body: "Tap the star on any drill to keep your go-to drills one tap away." },
    Recent: { icon: "history" as const, title: "Nothing yet", body: "Drills you open will show up here." },
    Notes: { icon: "note" as const, title: "No notes yet", body: "Add notes on any drill — what worked, what to tweak next time." },
  }[view];

  return (
    <Screen title="Saved" large header={<div className="field-pad" style={{ paddingBottom: 14 }}><Segmented options={VIEWS} value={view} onChange={setView} /></div>}>
      {drills.length ? (
        <div className="group">
          {drills.map((d) => (
            <div key={d.id}>
              <DrillRow drill={d} fav={view !== "Saved" && favs.includes(String(d.id))} onClick={() => nav.push({ name: "drill", id: d.id })} />
              {view === "Notes" && (
                <div className="row-sub" style={{ padding: "0 16px 12px 68px", whiteSpace: "normal", marginTop: -4 }}>
                  {notes[String(d.id)]}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <Icon name={empty.icon} size={44} stroke={1.6} />
          <h3>{empty.title}</h3>
          <p>{empty.body}</p>
        </div>
      )}
    </Screen>
  );
}
