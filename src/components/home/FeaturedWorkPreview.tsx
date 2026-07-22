import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ArrowRight, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { usePerspective } from "../../context/PerspectiveContext";

interface FeaturedWorkPreviewProps {
  setActivePage: (page: "home" | "services" | "work" | "pricing" | "contact") => void;
}

export default function FeaturedWorkPreview({ setActivePage }: FeaturedWorkPreviewProps) {
  const { perspective } = usePerspective();

  const featuredProjects = [
    {
      id: 0,
      title: "Zari & Silk Heritage Lookbook",
      category: "Bespoke Headless Commerce",
      location: "Jaipur, India",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      description: "Hardware-accelerated luxury lookbook experience with sub-second product filtering and direct stylist consultations.",
      execMetrics: [
        { label: "TTFB", value: "0.7s" },
        { label: "Consultation Lift", value: "+42%" },
        { label: "Performance", value: "98/100" }
      ],
      devMetrics: [
        { label: "Vercel Edge TTFB", value: "38ms" },
        { label: "Gzip Bundle", value: "38.4kB" },
        { label: "Hydration", value: "Selective RSC" }
      ],
      execTags: ["React 18", "Headless", "Hardware Accel", "Tailwind"],
      devTags: ["React 18 RSC", "Strict TS", "Tailwind JIT", "WCAG 2.1 AA"]
    },
    {
      id: 1,
      title: "Royal Jodhpur Timber Showcase",
      category: "Tactile Curated Showcase",
      location: "Rajasthan, India",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      description: "Museum-grade interactive teak timber comparison slider showcasing raw lumber provenance and custom artisan carvings.",
      execMetrics: [
        { label: "Lead Rate", value: "12.8%" },
        { label: "Bookings", value: "+55%" },
        { label: "Load Velocity", value: "0.4s" }
      ],
      devMetrics: [
        { label: "LCP / CLS", value: "0.4s / 0.00" },
        { label: "Canvas Engine", value: "60 FPS" },
        { label: "Edge Cache", value: "Hit (100%)" }
      ],
      execTags: ["TypeScript", "Canvas/Spline", "Tailwind", "Next.js"],
      devTags: ["Next.js 14 App Router", "Framer Motion", "Vite ESM", "Zero CLS"]
    }
  ];

  const handleNavigateWork = () => {
    setActivePage("work");
    window.location.hash = "#work";
    window.scrollTo({ top: 0, behavior: "instant" as any });
  };

  return (
    <section className="py-16 lg:py-24 bg-zinc-50/60 dark:bg-[#0c0c0e] border-b border-zinc-200/60 dark:border-zinc-850/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 mb-3">
              [ SELECTED WORK ]
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white">
              Featured Case Studies
            </h2>
          </div>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md font-sans leading-relaxed">
            Every project is engineered from first principles — zero generic templates, zero slow plugins.
          </p>
        </div>

        {/* Top 2 Case Studies Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-12">
          {featuredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group rounded-3xl bg-white dark:bg-[#111114] border border-zinc-200/80 dark:border-zinc-850/80 overflow-hidden shadow-lg hover:shadow-xl hover:border-violet-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Container with Hover Zoom */}
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-950/80 text-white backdrop-blur-md border border-white/20 shadow-md">
                      {project.category}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest block mb-0.5">
                      {project.location}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-display font-semibold tracking-tight group-hover:text-violet-300 transition-colors">
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6">
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 mb-6">
                    {(perspective === "developer" ? project.devMetrics : project.execMetrics).map((metric, mIdx) => (
                      <div key={mIdx} className="text-center">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block mb-0.5">
                          {metric.label}
                        </span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-violet-600 dark:text-violet-400">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {(perspective === "developer" ? project.devTags : project.execTags).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded-md border ${
                          perspective === "developer"
                            ? "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border-violet-200/60 dark:border-violet-800/60 font-bold"
                            : "text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200/60 dark:border-zinc-700/60"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/20 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 font-medium">Explore Architecture</span>
                <button
                  onClick={handleNavigateWork}
                  className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform cursor-pointer"
                >
                  View Case Study <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Section Footer CTA Button */}
        <div className="text-center">
          <button
            onClick={handleNavigateWork}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-violet-600 dark:hover:bg-violet-500 rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-violet-600/15 cursor-pointer"
          >
            Explore All Case Studies (5+)
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
}
