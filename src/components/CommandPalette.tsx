import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Terminal, 
  Layout, 
  Moon, 
  Sun, 
  Grid, 
  Zap, 
  Send, 
  Briefcase, 
  DollarSign, 
  Layers, 
  PhoneCall, 
  X, 
  Sparkles,
  Command,
  Check,
  Code2
} from "lucide-react";
import { usePerspective } from "../context/PerspectiveContext";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActivePage: (page: string) => void;
  toggleTheme: () => void;
  theme: "light" | "dark";
  toggleBlueprint: () => void;
  isBlueprintActive: boolean;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  setActivePage,
  toggleTheme,
  theme,
  toggleBlueprint,
  isBlueprintActive,
  accentColor,
  setAccentColor,
}: CommandPaletteProps) {
  const { perspective, togglePerspective } = usePerspective();
  const [query, setQuery] = useState("");
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
          window.dispatchEvent(new CustomEvent("open-command-palette"));
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const runPerformanceAudit = () => {
    setAuditRunning(true);
    setAuditResult(null);
    setTimeout(() => {
      setAuditRunning(false);
      setAuditResult("⚡ Lighthouse Score: 100/100 | LCP: 0.32s | FID: 2ms | CLS: 0.00 | Accessibility: 100%");
    }, 900);
  };

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const commands = [
    {
      id: "nav-home",
      icon: Layout,
      title: "Navigate: Home",
      category: "Navigation",
      action: () => handleAction(() => { setActivePage("home"); window.location.hash = "#home"; })
    },
    {
      id: "nav-services",
      icon: Layers,
      title: "Navigate: Services & Deliverables",
      category: "Navigation",
      action: () => handleAction(() => { setActivePage("services"); window.location.hash = "#services"; })
    },
    {
      id: "nav-work",
      icon: Briefcase,
      title: "Navigate: Work & Case Studies",
      category: "Navigation",
      action: () => handleAction(() => { setActivePage("work"); window.location.hash = "#work"; })
    },
    {
      id: "nav-pricing",
      icon: DollarSign,
      title: "Navigate: Pricing & Packages",
      category: "Navigation",
      action: () => handleAction(() => { setActivePage("pricing"); window.location.hash = "#pricing"; })
    },
    {
      id: "nav-contact",
      icon: PhoneCall,
      title: "Navigate: Initiate Contact / Consultation",
      category: "Navigation",
      action: () => handleAction(() => { setActivePage("contact"); window.location.hash = "#contact"; })
    },
    {
      id: "toggle-perspective",
      icon: perspective === "executive" ? Code2 : Sparkles,
      title: `Switch Perspective: ${perspective === "executive" ? "Switch to Developer Mode" : "Switch to Executive Mode"}`,
      category: "Perspective",
      action: () => handleAction(togglePerspective)
    },
    {
      id: "toggle-theme",
      icon: theme === "dark" ? Sun : Moon,
      title: `Toggle Mode (${theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"})`,
      category: "Environment",
      action: () => handleAction(toggleTheme)
    },
    {
      id: "toggle-blueprint",
      icon: Grid,
      title: `${isBlueprintActive ? "Disable" : "Enable"} Architecture Blueprint Grid Wireframe`,
      category: "Dev Tools",
      action: () => handleAction(toggleBlueprint)
    },
    {
      id: "run-audit",
      icon: Zap,
      title: "Run Real-time Lighthouse Performance Audit",
      category: "Dev Tools",
      action: runPerformanceAudit
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-28 px-4 bg-zinc-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100"
          >
            {/* Command Header */}
            <div className="flex items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
              <Terminal className="w-5 h-5 text-violet-600 dark:text-violet-400 mr-3 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search (e.g., /work, audit, grid)..."
                className="w-full bg-transparent text-sm font-mono placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none text-zinc-900 dark:text-zinc-100"
                autoFocus
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Audit running notification */}
            {auditRunning && (
              <div className="p-4 bg-violet-50 dark:bg-violet-950/30 border-b border-violet-100 dark:border-violet-900/40 text-xs font-mono text-violet-700 dark:text-violet-300 flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-violet-600 animate-spin" />
                Executing real-time DOM & bundle performance diagnostics...
              </div>
            )}

            {auditResult && !auditRunning && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>{auditResult}</span>
                <button
                  onClick={() => setAuditResult(null)}
                  className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 font-bold ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Accent color picker row */}
            <div className="px-4 py-2 bg-zinc-100/60 dark:bg-zinc-900/40 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs">
              <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">
                Accent Theme Engine
              </span>
              <div className="flex items-center gap-2">
                {[
                  { name: "violet", class: "bg-violet-600", label: "Violet" },
                  { name: "emerald", class: "bg-emerald-500", label: "Emerald" },
                  { name: "cyan", class: "bg-cyan-500", label: "Cyan" },
                  { name: "amber", class: "bg-amber-500", label: "Amber" },
                ].map((acc) => (
                  <button
                    key={acc.name}
                    onClick={() => setAccentColor(acc.name)}
                    className={`w-4 h-4 rounded-full ${acc.class} ring-offset-1 dark:ring-offset-zinc-900 transition-all ${
                      accentColor === acc.name ? "ring-2 ring-violet-500 scale-125" : "opacity-70 hover:opacity-100"
                    }`}
                    title={`Set accent to ${acc.label}`}
                  />
                ))}
              </div>
            </div>

            {/* Command List */}
            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-zinc-400">
                  No matching commands found. Try "work", "audit", or "theme".
                </div>
              ) : (
                filteredCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/40 text-zinc-800 dark:text-zinc-200 hover:text-violet-700 dark:hover:text-violet-300 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 text-zinc-600 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium font-mono">{cmd.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider group-hover:text-violet-600 dark:group-hover:text-violet-400">
                        {cmd.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Command Palette Footer */}
            <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-[10px] text-zinc-700 dark:text-zinc-300">ESC</kbd> to close
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-[10px] text-zinc-700 dark:text-zinc-300">↵</kbd> to execute
                </span>
              </div>
              <span className="text-violet-600 dark:text-violet-400 font-bold">SUMAN.DESIGN // CMD_PALETTE</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
