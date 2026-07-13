"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { createInitialState, cvReducer } from "./cv-reducer";
import { hasAnyData } from "./empty-checks";
import type { CVAction, CVDocument } from "./cv-types";

interface CVContextValue {
  cv: CVDocument;
  dispatch: Dispatch<CVAction>;
}

const CVContext = createContext<CVContextValue | null>(null);

export function CVProvider({ children }: { children: ReactNode }) {
  const [cv, dispatch] = useReducer(cvReducer, undefined, createInitialState);

  // Data-loss guard (FR-027): arm the native leave-site warning only while there
  // is customer data to protect; disarm the moment the app is empty or reset.
  useEffect(() => {
    if (!hasAnyData(cv)) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [cv]);

  return <CVContext.Provider value={{ cv, dispatch }}>{children}</CVContext.Provider>;
}

export function useCV(): CVContextValue {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error("useCV must be used within a CVProvider");
  return ctx;
}
