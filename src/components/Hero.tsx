import { ArrowRight, CheckCircle2, Sparkles, Code2, Globe, Zap, Cpu, PenTool, ShoppingBag, Coffee, Home, GraduationCap, HeartPulse, Building2 } from "lucide-react";
import { motion } from "motion/react";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

const floatVariants = {
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface HeroProps {
  setActivePage: (page: "home" | "services" | "work" | "pricing" | "contact") => void;
}

export default function Hero({ setActivePage }: HeroProps) {
  const handlePageNavigate = (page: "home" | "services" | "work" | "pricing" | "contact") => {
    setActivePage(page);
    window.location.hash = `#${page}`;
    window.scrollTo({
      top: 0,
      behavior: "instant" as any
    });
  };

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-4rem)] lg:min-h-screen pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 lg:pb-24 flex items-center justify-center overflow-hidden noise-bg bg-[#f5f5f7] dark:bg-[#09090b] transition-colors duration-300"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-violet-400/10 dark:bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-cyan-400/10 dark:bg-cyan-600/5 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <motion.div
            className="lg:col-span-7 flex flex-col justify-center items-center lg:items-start text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
          >
            {/* Tagline Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center self-center lg:self-start">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/40 border border-violet-200/50 dark:border-violet-800/50 shadow-xs mb-6">
                <PenTool className="w-3.5 h-3.5" />
                Handcrafted Digital Experiences
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.1] mb-6"
            >
              Premium Websites <br />
              Built To Grow <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500 dark:from-violet-400 dark:to-cyan-400">
                Your Business
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8"
            >
              We design and develop modern, ultra-fast, and conversion-focused websites for businesses, startups, and professionals who demand a premium digital presence.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto justify-center lg:justify-start"
            >
              <button
                onClick={() => handlePageNavigate("contact")}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 font-medium text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 rounded-xl shadow-md transition-all cursor-pointer group"
              >
                Start Your Project
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => handlePageNavigate("work")}
                className="inline-flex items-center justify-center px-7 py-4 font-medium text-zinc-800 dark:text-zinc-200 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors shadow-xs cursor-pointer"
              >
                View Portfolio
              </button>
            </motion.div>

            {/* Key Features Checkmarks */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-900 w-full justify-items-center sm:justify-items-start"
            >
              {[
                { label: "Mobile Optimized", icon: Globe },
                { label: "Fast Loading", icon: Zap },
                { label: "SEO Friendly", icon: CheckCircle2 },
                { label: "Bespoke Design", icon: Code2 }
              ].map((feat, index) => (
                <div key={index} className="flex items-center gap-2 justify-center sm:justify-start">
                  <feat.icon className="w-4.5 h-4.5 text-violet-500 dark:text-violet-400 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-left">
                    {feat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Right Visual Column */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <motion.div
              className="w-full max-w-[28rem] relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            >
              {/* Dynamic Interactive Panel / Dashboard Mockup */}
              <div
                className="glass-card rounded-2xl border border-zinc-200/50 dark:border-zinc-850/50 p-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-float transform-gpu"
              >
                {/* Header Mockup */}
                <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-850/60 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-md">
                    https://sumandesign.in
                  </span>
                </div>

                {/* Dashboard Stats Panel */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100/50 dark:border-violet-900/30 text-center">
                    <span className="block text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
                      Lighthouse Score
                    </span>
                    <span className="text-3xl font-display font-bold text-zinc-850 dark:text-zinc-100">
                      100%
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100/50 dark:border-cyan-900/30 text-center">
                    <span className="block text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                      Page Load Time
                    </span>
                    <span className="text-3xl font-display font-bold text-zinc-850 dark:text-zinc-100">
                      0.5s
                    </span>
                  </div>
                </div>

                {/* Simulated Terminal code block */}
                <div className="p-4 rounded-xl bg-zinc-950 text-zinc-300 font-mono text-xs text-left mb-4 shadow-inner">
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] text-zinc-500 border-b border-zinc-900 pb-1.5">
                    <Code2 className="w-3.5 h-3.5 text-violet-400" />
                    <span>Lighthouse Audit</span>
                  </div>
                  <div className="text-violet-400">const agency = SumanDesign();</div>
                  <div className="text-cyan-400">const speed = agency.optimize();</div>
                  <div className="text-emerald-400">
                    {"console.log(`Speed: ${speed.loadTime}s`);"}
                  </div>
                  <div className="text-zinc-500">// Output: Speed: 0.5s ✔</div>
                </div>

                {/* Floating Indicators */}
                <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-850 px-4.5 py-3.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      Accepting New Projects
                    </span>
                  </div>
                  <Zap className="w-4 h-4 text-amber-500 animate-bounce" />
                </div>
              </div>

              {/* Decorative extra absolute elements */}
              <div
                className="absolute -top-3 -right-2 sm:-top-6 sm:-right-6 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg animate-slow-rotate transform-gpu"
              >
                <Cpu className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
              </div>

              <div
                className="absolute -bottom-3 -left-2 sm:-bottom-6 sm:-left-6 glass-panel rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 border border-zinc-200 dark:border-zinc-850 shadow-md flex items-center gap-1.5 sm:gap-2 animate-float-delayed transform-gpu"
              >
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
                <span className="text-[10px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Global Delivery
                </span>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Brand Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8 sm:mt-10 lg:mt-12 pt-8 border-t border-zinc-200/60 dark:border-zinc-900"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left shrink-0">
              <span className="text-[10px] font-bold tracking-widest text-violet-600 dark:text-violet-400 uppercase block mb-1.5">
                Our Ecosystem
              </span>
              <h3 className="text-sm font-semibold text-zinc-750 dark:text-zinc-300">
                Powering high-growth brands & elite professionals
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-wrap sm:w-auto items-center justify-items-center sm:justify-start md:justify-end sm:gap-4 max-w-3xl">
              {[
                { name: "Zari & Silk", industry: "Boutique", icon: ShoppingBag },
                { name: "Araku Valley", industry: "Coffee", icon: Coffee },
                { name: "Royal Jodhpur", industry: "Furniture", icon: Home },
                { name: "Vidya Mandir", industry: "Academy", icon: GraduationCap },
                { name: "Arogya Lab", industry: "Health", icon: HeartPulse },
                { name: "DLF Signature", industry: "Realty", icon: Building2 }
              ].map((client, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center sm:justify-start w-full sm:w-auto gap-2 px-2.5 sm:px-3 py-2 rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-white/45 dark:bg-zinc-900/30 backdrop-blur-xs text-[11px] sm:text-xs font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-xs hover:border-violet-400/40 dark:hover:border-violet-500/40 group cursor-default"
                >
                  <client.icon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors shrink-0" />
                  <span className="text-zinc-800 dark:text-zinc-200 whitespace-nowrap">{client.name}</span>
                  <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-sm bg-zinc-150 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold shrink-0">
                    {client.industry}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
