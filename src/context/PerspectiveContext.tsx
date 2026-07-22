import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Code2, Briefcase } from "lucide-react";

export type PerspectiveMode = "executive" | "developer";

interface PerspectiveContextType {
  perspective: PerspectiveMode;
  setPerspective: (mode: PerspectiveMode) => void;
  togglePerspective: () => void;
}

const PerspectiveContext = createContext<PerspectiveContextType | undefined>(undefined);

const STORAGE_KEY = "suman_design_perspective";

export const PerspectiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [perspective, setPerspectiveState] = useState<PerspectiveMode>("executive");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial load from URL query params or localStorage
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get("view");
      if (viewParam === "dev" || viewParam === "developer") {
        setPerspectiveState("developer");
        return;
      }
      if (viewParam === "exec" || viewParam === "executive") {
        setPerspectiveState("executive");
        return;
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "developer" || saved === "executive") {
        setPerspectiveState(saved);
      }
    } catch {
      // Ignore fallback
    }
  }, []);

  const setPerspective = (mode: PerspectiveMode) => {
    setPerspectiveState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore
    }

    // Trigger toast notification
    if (mode === "executive") {
      setToastMessage("Executive Mode: Showing business metrics & conversion focus.");
    } else {
      setToastMessage("Developer Mode: Showing technical specs & system architecture.");
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const togglePerspective = () => {
    setPerspective(perspective === "executive" ? "developer" : "executive");
  };

  return (
    <PerspectiveContext.Provider value={{ perspective, setPerspective, togglePerspective }}>
      {children}

      {/* Global Mode Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[90] px-4 py-2.5 rounded-full bg-zinc-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-950 text-xs font-mono shadow-2xl border border-violet-500/30 dark:border-violet-400/30 flex items-center gap-2.5 backdrop-blur-md pointer-events-none"
          >
            {perspective === "executive" ? (
              <Briefcase className="w-4 h-4 text-violet-400 dark:text-violet-600 shrink-0" />
            ) : (
              <Code2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            )}
            <span className="font-medium tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </PerspectiveContext.Provider>
  );
};

export const usePerspective = (): PerspectiveContextType => {
  const context = useContext(PerspectiveContext);
  if (!context) {
    throw new Error("usePerspective must be used within a PerspectiveProvider");
  }
  return context;
};
