import { motion } from "motion/react";
import { ArrowRight, Calendar, Sparkles, ShieldCheck } from "lucide-react";

interface FinalCtaBannerProps {
  setActivePage: (page: "home" | "services" | "work" | "pricing" | "contact") => void;
}

export default function FinalCtaBanner({ setActivePage }: FinalCtaBannerProps) {
  const handleInitiateProject = () => {
    setActivePage("contact");
    window.location.hash = "#contact";
    window.scrollTo({ top: 0, behavior: "instant" as any });
  };

  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-[#09090b] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 dark:from-[#0f0e13] dark:via-[#14121a] dark:to-[#0f0e13] text-white border border-violet-500/30 shadow-2xl shadow-violet-500/10 overflow-hidden text-center"
        >
          {/* Ambient Background Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-mono font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Q3 CAPACITY: 1 ACTIVE SLOT AVAILABLE</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold tracking-tight text-white mb-6 leading-[1.15]">
              Ready to build a web asset <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-violet-200 to-amber-200">
                your reputation deserves?
              </span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 font-sans leading-relaxed mb-8 max-w-2xl">
              Partner with an independent digital studio that values speed, bespoke aesthetic discipline, and direct commercial results. Receive a complete architectural proposal in 24 hours.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md mb-8">
              <button
                onClick={handleInitiateProject}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-wider text-white bg-violet-600 hover:bg-violet-500 rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-violet-600/30 cursor-pointer"
              >
                Initiate Project
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={handleInitiateProject}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer backdrop-blur-md"
              >
                <Calendar className="w-4 h-4 text-violet-300" />
                Schedule Discovery Call
              </button>
            </div>

            {/* Guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% Fixed Quote
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                2-Week Average Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                WCAG 100% AA Guarantee
              </span>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
