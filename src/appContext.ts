import { createContext, useContext } from "react";
import type { Route } from "./components/ui";

export type Tab = "drills" | "plans" | "saved" | "settings";

/* Global actions: open Practice Mode, switch tabs. */
export interface AppActions {
  startPractice: (planId: string) => void;
  goTo: (tab: Tab, route?: Route) => void;
}
export const AppContext = createContext<AppActions>({ startPractice: () => {}, goTo: () => {} });
export const useApp = () => useContext(AppContext);
