import { X, Calendar, DollarSign, Clock, CheckCircle2, ChevronRight, BarChart3, Star } from "lucide-react";
import { motion } from "motion/react";
import { Project } from "../types";

interface CaseStudyModalProps {
  project: Project;
  onClose: () => void;
}

export default function CaseStudyModal({ project, onClose }: CaseStudyModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background Dark Overlay */}
      <div
        className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Card content */}
      <motion.div
        className="relative bg-white dark:bg-zinc-950 w-full max-w-4xl rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 px-6 py-4.5 shrink-0 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-900/40">
              {project.category}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              / Case Study Detail
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-150 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close Case Study Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          
          {/* Main Title Banner */}
          <div className="text-left border-b border-zinc-100 dark:border-zinc-900 pb-6">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 dark:text-white mb-3">
              {project.title}
            </h1>
            <p className="text-base text-zinc-650 dark:text-zinc-400 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Project Featured Image */}
          {project.imageUrl && (
            <div className="aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden border border-zinc-200/60 dark:border-zinc-800/80 shadow-md">
              <img
                src={project.imageUrl}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Stats Highlight Panel */}
          {project.stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {project.stats.map((st, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-900/40 text-left"
                >
                  <span className="block text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-550 tracking-wider mb-1.5">
                    {st.label}
                  </span>
                  <span className="text-2xl font-display font-extrabold text-violet-650 dark:text-violet-400">
                    {st.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Main Two-Column Structure */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Case Study Text content (Challenge, Solution, Results) */}
            <div className="md:col-span-8 space-y-6 text-left">
              
              {/* Challenge */}
              <div className="space-y-2.5">
                <h3 className="text-base font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  The Challenge
                </h3>
                <p className="text-sm text-zinc-650 dark:text-zinc-450 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/10 p-5 rounded-xl border border-zinc-100 dark:border-zinc-900/50">
                  {project.challenge}
                </p>
              </div>

              {/* Solution */}
              <div className="space-y-2.5">
                <h3 className="text-base font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  Our Solution
                </h3>
                <p className="text-sm text-zinc-650 dark:text-zinc-450 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/10 p-5 rounded-xl border border-zinc-100 dark:border-zinc-900/50">
                  {project.solution}
                </p>
              </div>

              {/* Results Checklist */}
              <div className="space-y-3.5">
                <h3 className="text-base font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Proven Outcomes
                </h3>
                <ul className="space-y-3">
                  {project.results.map((res, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/20 p-4.5 rounded-xl text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Right Column: Project Metadata Card */}
            <div className="md:col-span-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-900/50 rounded-2xl p-6 space-y-5 text-left">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white pb-3 border-b border-zinc-200/50 dark:border-zinc-900/50 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-500" />
                Project Stats
              </h3>

              {/* Metadatas */}
              <div className="space-y-4">
                <div className="flex justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-900/40">
                  <span className="text-zinc-450">Client Partner</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{project.client}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-900/40">
                  <span className="text-zinc-450">Total Timeline</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{project.timeline}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-900/40">
                  <span className="text-zinc-450">Bespoke Budget</span>
                  <span className="font-mono font-semibold text-zinc-850 dark:text-zinc-250">{project.budget}</span>
                </div>
              </div>

              {/* Technologies list */}
              <div className="space-y-3 pt-2">
                <span className="block text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                  Technology Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono font-medium text-zinc-650 dark:text-zinc-450 bg-zinc-200/50 dark:bg-zinc-900 border border-zinc-300/30 dark:border-zinc-800/40 px-2.5 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust block */}
              <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-250/40 dark:border-zinc-850/50 flex items-start gap-2.5 mt-2">
                <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 fill-amber-500" />
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                  Every metric has been audited independently. No simulated or artificial analytics.
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4.5 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            Close Details
          </button>
          <a
            href="#contact"
            onClick={(e) => {
              onClose();
              const el = document.getElementById("contact");
              if (el) {
                e.preventDefault();
                const offset = 80;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = el.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
              }
            }}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md cursor-pointer"
          >
            Inquire Similar Design
          </a>
        </div>

      </motion.div>
    </motion.div>
  );
}
