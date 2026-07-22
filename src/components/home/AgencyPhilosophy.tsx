import { motion } from "motion/react";
import { XCircle, CheckCircle2, AlertTriangle, Zap, ShieldCheck, Sparkles } from "lucide-react";

export default function AgencyPhilosophy() {
  const templateDrawbacks = [
    { title: "Slow Loading & Bloat", desc: "Excessive unused CSS/JS and heavy plugins result in 3s+ load times and high bounce rates." },
    { title: "Generic Visual Identity", desc: "Looks like thousands of other websites, failing to project high-ticket authority or premium trust." },
    { title: "Fragile Security & Maintenance", desc: "Outdated third-party plugins present continuous vulnerability risks and broken layouts." },
    { title: "Low SEO & Core Web Vitals", desc: "Heavy DOM structures and layout shifts fail Google's Core Web Vitals mobile benchmarks." }
  ];

  const customAdvantages = [
    { title: "Sub-Second Edge Performance", desc: "Hand-coded React/Next.js architecture Edge-cached for under 0.4s Time to First Byte globally." },
    { title: "Bespoke Brand Identity", desc: "Tailored visual hierarchies, custom typography, and zero-compromise design systems built for high conversion." },
    { title: "Zero-Vulnerability Codebase", desc: "Clean TypeScript code without unnecessary external plugin dependencies or security vulnerabilities." },
    { title: "100/100 Core Web Vitals", desc: "Zero Cumulative Layout Shift (CLS: 0.00) and perfect Lighthouse scores for maximum SEO ranking." }
  ];

  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-[#09090b] border-b border-zinc-200/60 dark:border-zinc-850/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 mb-3">
            [ THE STANDARD & PHILOSOPHY ]
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
            Why Custom Architecture Over Templates?
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
            Your website is the single most important asset representing your business reputation online. Generic templates cost you client trust and revenue every single day.
          </p>
        </div>

        {/* 2-Column Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* Left Column: The Template Trap */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6 sm:p-8 rounded-3xl bg-red-500/[0.03] dark:bg-red-950/[0.1] border border-red-200/60 dark:border-red-900/40 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-red-200/40 dark:border-red-900/40">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-bold font-mono uppercase tracking-wider text-red-700 dark:text-red-400">
                    The Template Trap
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-2.5 py-1 rounded-full">
                  Low-Tier Standard
                </span>
              </div>

              <div className="space-y-5">
                {templateDrawbacks.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-red-200/40 dark:border-red-900/40 text-center">
              <span className="text-[11px] font-mono text-red-600 dark:text-red-400 font-semibold">
                Result: High Bounce Rates • Low SEO • Diminished Trust
              </span>
            </div>
          </motion.div>

          {/* Right Column: The Suman.design Standard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6 sm:p-8 rounded-3xl bg-violet-500/[0.04] dark:bg-violet-950/[0.2] border border-violet-200/80 dark:border-violet-800/60 shadow-xl shadow-violet-500/5 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-violet-200/60 dark:border-violet-800/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <h3 className="text-lg font-bold font-mono uppercase tracking-wider text-violet-700 dark:text-violet-300">
                    The Suman.design Standard
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/80 px-2.5 py-1 rounded-full border border-violet-200 dark:border-violet-700/80">
                  Bespoke Engineering
                </span>
              </div>

              <div className="space-y-5">
                {customAdvantages.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-violet-200/60 dark:border-violet-800/60 text-center">
              <span className="text-[11px] font-mono text-violet-700 dark:text-violet-300 font-bold">
                Result: Sub-Second Load • High Conversion • Enterprise Authority
              </span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
