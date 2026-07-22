import React from "react";
import { motion } from "motion/react";
import { usePerspective, PerspectiveMode } from "../context/PerspectiveContext";
import { Sparkles, Code2 } from "lucide-react";

export default function PerspectiveToggle() {
  const { perspective, setPerspective } = usePerspective();

  return (
    <div 
      className="inline-flex items-center p-1 bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 rounded-full shadow-inner font-mono text-[11px] select-none scale-90 xs:scale-95 sm:scale-100 origin-center"
      role="group"
      aria-label="Perspective View Mode Toggle"
    >
      <button
        type="button"
        onClick={() => setPerspective("executive")}
        aria-pressed={perspective === "executive"}
        className={`relative flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
          perspective === "executive"
            ? "text-white dark:text-white"
            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        }`}
      >
        {perspective === "executive" && (
          <motion.div
            layoutId="activePerspectivePill"
            className="absolute inset-0 bg-violet-600 dark:bg-violet-600 rounded-full shadow-sm"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300 dark:text-amber-300 shrink-0" />
          <span className="text-[10px] sm:text-[11px] hidden sm:inline">Executive</span>
          <span className="text-[10px] sm:hidden">Exec</span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => setPerspective("developer")}
        aria-pressed={perspective === "developer"}
        className={`relative flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
          perspective === "developer"
            ? "text-white dark:text-white"
            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        }`}
      >
        {perspective === "developer" && (
          <motion.div
            layoutId="activePerspectivePill"
            className="absolute inset-0 bg-violet-600 dark:bg-violet-600 rounded-full shadow-sm"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1">
          <Code2 className="w-3 h-3 text-emerald-300 dark:text-emerald-300 shrink-0" />
          <span className="text-[10px] sm:text-[11px] hidden sm:inline">Developer</span>
          <span className="text-[10px] sm:hidden">Dev</span>
        </span>
      </button>
    </div>
  );
}
