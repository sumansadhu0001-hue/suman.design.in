import { Palette, Code, Zap, ShoppingBag, ShieldCheck, Cpu, Check } from "lucide-react";
import { ComponentType, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SERVICES } from "../data";
import { SkeletonGrid } from "./SkeletonLoader";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Palette,
  Code,
  Zap,
  ShoppingBag,
  ShieldCheck,
  Cpu
};

export default function Services() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="services"
      className="py-12 sm:py-24 bg-[#f5f5f7] dark:bg-[#09090b] transition-colors duration-300 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-3.5 py-1.5 rounded-full border border-violet-100 dark:border-violet-900/50">
              Agency Expertise
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mt-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Creative Solutions Built for Performance
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-zinc-650 dark:text-zinc-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We balance aesthetic restraint with technical precision. Every website is custom-engineered to elevate your business's visual footprint and speed.
          </motion.p>
        </div>

        {/* Services Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div key="skeleton-services">
              <SkeletonGrid type="services" count={6} />
            </div>
          ) : (
            <motion.div
              key="real-services"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {SERVICES.map((srv, index) => {
                const IconComponent = iconMap[srv.iconName] || Code;
                return (
                  <motion.div
                    key={srv.id}
                    className="bg-white dark:bg-[#161617]/95 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:border-violet-600 dark:hover:border-violet-500 hover:shadow-[0_12px_40px_-12px_rgba(124,58,237,0.12)] transition-all duration-300 group"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: "easeOut",
                      delay: index * 0.06
                    }}
                  >
                    {/* Header & Icon */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-md">
                          {srv.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-3">
                        {srv.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                        {srv.description}
                      </p>

                      {/* Detail Bullet List */}
                      <div className="border-t border-zinc-100 dark:border-zinc-900/80 pt-5 mt-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3.5">
                          What is Included
                        </h4>
                        <ul className="space-y-2.5">
                          {srv.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 leading-tight">
                              <Check className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Benefits / Outcomes */}
                    <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                        Core Outcome
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {srv.benefits.map((benefit, bIdx) => (
                          <span
                            key={bIdx}
                            className="inline-block text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
