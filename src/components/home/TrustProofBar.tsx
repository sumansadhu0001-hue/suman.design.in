import { motion } from "motion/react";
import { Zap, Award, Code2, TrendingUp } from "lucide-react";

export default function TrustProofBar() {
  const stats = [
    {
      icon: Zap,
      metric: "<0.4s",
      label: "Average Time to First Byte",
      color: "text-violet-600 dark:text-violet-400"
    },
    {
      icon: Award,
      metric: "100/100",
      label: "Core Web Vitals Benchmark",
      color: "text-amber-500 dark:text-amber-400"
    },
    {
      icon: Code2,
      metric: "100%",
      label: "Bespoke Code (Zero Templates)",
      color: "text-emerald-600 dark:text-emerald-400"
    },
    {
      icon: TrendingUp,
      metric: "+40%",
      label: "Average Conversion Lift",
      color: "text-cyan-600 dark:text-cyan-400"
    }
  ];

  const clientLogos = [
    "ZARI & SILK",
    "ROYAL JODHPUR",
    "AROGYA HEALTH",
    "HERITAGE CRAFT",
    "APEX LABS",
    "VALO ARCHITECTURE"
  ];

  return (
    <section className="py-12 lg:py-16 bg-white dark:bg-[#09090b] border-t border-b border-zinc-200/60 dark:border-zinc-850/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header Tag */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 mb-3">
            [ AUTHORITY SIGNALS & PROOF ]
          </span>
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase font-mono">
            Trusted by Forward-Thinking Brands & Founders
          </p>
        </div>

        {/* 4-Column Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="p-5 sm:p-6 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between hover:border-violet-500/40 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-[10px] font-mono text-zinc-400">0{idx + 1}</span>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl lg:text-4xl font-display font-bold ${item.color} tracking-tight mb-1`}>
                    {item.metric}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-snug">
                    {item.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Brand Logos Row */}
        <div className="pt-8 border-t border-zinc-200/40 dark:border-zinc-850/40">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-14 opacity-60 hover:opacity-100 transition-opacity">
            {clientLogos.map((brand, i) => (
              <span
                key={i}
                className="font-mono text-xs sm:text-sm font-bold tracking-widest text-zinc-700 dark:text-zinc-300 select-none hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
