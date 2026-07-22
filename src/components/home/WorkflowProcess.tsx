import { motion } from "motion/react";
import { Search, Compass, Code, Rocket, Check } from "lucide-react";

export default function WorkflowProcess() {
  const steps = [
    {
      num: "01",
      icon: Search,
      title: "Discovery & Brief",
      desc: "We analyze your business goals, target audience, brand aesthetic, and technical requirements in a 30-min strategy session."
    },
    {
      num: "02",
      icon: Compass,
      title: "UI/UX Architecture",
      desc: "Custom Figma wireframes and high-fidelity visual prototypes developed for rapid client feedback and seamless sign-off."
    },
    {
      num: "03",
      icon: Code,
      title: "High-Performance Build",
      desc: "Clean, zero-dependency development in React 18, Next.js, and Tailwind CSS. Built for speed, accessibility, and security."
    },
    {
      num: "04",
      icon: Rocket,
      title: "Audit & Deployment",
      desc: "Rigorous Core Web Vitals audit, WCAG 100% AA checks, domain setup, edge CDN caching, and smooth production launch."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-[#09090b] border-b border-zinc-200/60 dark:border-zinc-850/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 mb-3">
            [ ENGAGEMENT TIMELINE ]
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
            How We Execute Your Vision
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
            A frictionless 4-step workflow engineered for clarity, speed, and exceptional digital craftsmanship.
          </p>
        </div>

        {/* 4-Step Timeline Grid (Horizontal on desktop, vertical on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="p-6 rounded-3xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between hover:border-violet-500/40 transition-all duration-300 relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-mono font-bold text-violet-600 dark:text-violet-400">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-display font-semibold text-zinc-900 dark:text-white mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-200/40 dark:border-zinc-800/40 flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Phase {step.num} Milestone</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
