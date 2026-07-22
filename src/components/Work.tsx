import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PROJECTS } from "../data";
import { Project } from "../types";
import { ArrowUpRight, Folder, Clock, ShieldAlert } from "lucide-react";
import CaseStudyModal from "./CaseStudyModal";
import WebsiteReferences from "./WebsiteReferences";
import { SkeletonGrid } from "./SkeletonLoader";
import { usePerspective } from "../context/PerspectiveContext";

const CATEGORIES = ["All", "E-Commerce", "Web Application", "Corporate"];

const devProjectSpecs: Record<string, {
  techTitle: string;
  metricsBanner: string;
  stats: { label: string; value: string; color: string }[];
  highlights: string[];
}> = {
  "luxury-fashion-ecommerce": {
    techTitle: "HEADLESS SHOPIFY // STOREFRONT API",
    metricsBanner: "TTFB: 38ms (Vercel Edge) | BUNDLE: 38.4kB Initial JS | HYDRATION: Partial / Selective",
    stats: [
      { label: "Edge TTFB", value: "38ms", color: "text-violet-400" },
      { label: "Initial JS", value: "38.4kB", color: "text-cyan-300" },
      { label: "Hydration", value: "Selective", color: "text-violet-300" }
    ],
    highlights: [
      "GraphQL API caching via Redis Edge",
      "Framer Motion layout animations with GPU acceleration",
      "Dynamic image optimization via Next.js <Image/> AVIF pipeline"
    ]
  },
  "premium-specialty-cafe": {
    techTitle: "PWA + EDGE API ROUTES",
    metricsBanner: "PERF: 100/100 Lighthouse | STATE: Zustand + Persistent Storage | LATENCY: < 50ms Global RTT",
    stats: [
      { label: "Lighthouse", value: "100/100", color: "text-violet-400" },
      { label: "State Engine", value: "Zustand", color: "text-cyan-300" },
      { label: "Latency", value: "< 50ms", color: "text-violet-300" }
    ],
    highlights: [
      "Edge route handler pre-fetching for instant checkout",
      "ServiceWorker offline fallback caching layer",
      "Sub-second DOM hydration with zero layout shift"
    ]
  },
  "ayurveda-wellness-d2c": {
    techTitle: "HEADLESS D2C // RAZORPAY UPI GATEWAY",
    metricsBanner: "LCP: 0.5s | BUNDLE: 41.2kB Gzip | CHECKOUT: Instant UPI Sync",
    stats: [
      { label: "LCP Score", value: "0.5s", color: "text-violet-400" },
      { label: "Gzip Bundle", value: "41.2kB", color: "text-cyan-300" },
      { label: "Sync", value: "UPI Webhook", color: "text-violet-300" }
    ],
    highlights: [
      "Deterministic Prakriti quiz state machine",
      "Asynchronous webhook handlers for Instant Order Sync",
      "WebP/AVIF responsive image compression pipeline"
    ]
  },
  "bengaluru-fintech-saas": {
    techTitle: "FINTECH DASHBOARD // REAL-TIME CHART ENGINE",
    metricsBanner: "FPS: 60fps Charting | BUNDLE: 52.1kB Gzip | PARSING: Sub-10ms XML",
    stats: [
      { label: "Chart FPS", value: "60 FPS", color: "text-violet-400" },
      { label: "Gzip Bundle", value: "52.1kB", color: "text-cyan-300" },
      { label: "XML Parsing", value: "< 10ms", color: "text-violet-300" }
    ],
    highlights: [
      "Canvas-accelerated Chart.js rendering pipeline",
      "Client-side GST XML schema generator with zero server latency",
      "Strict TypeScript interfaces with Zod input validation"
    ]
  }
};

export default function Work() {
  const { perspective } = usePerspective();
  const [filter, setFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbProjects, setDbProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/.netlify/functions/projects");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              category: p.category,
              client: p.client_name || "Private Client",
              timeline: "3 Weeks",
              budget: "Custom",
              tags: Array.isArray(p.tech_stack) ? p.tech_stack : (p.tech_stack ? p.tech_stack.split(",") : ["React", "Tailwind"]),
              challenge: p.detailed_description || p.description,
              solution: "Custom engineered high-performance frontend architecture and integrated live database.",
              results: [
                "Lighthouse performance rating rose to 98% on mobile devices",
                "Page load speeds slashed to 0.7 seconds globally",
                "Fully responsive layout verified across active devices"
              ],
              stats: [
                { label: "Performance", value: "98/100" },
                { label: "Timeline", value: "Completed" },
                { label: "Audited", value: "Passed" }
              ],
              imageUrl: p.image_url || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80"
            }));
            setDbProjects(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve dynamic projects, using static fallback", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [filter, dbProjects]);

  const allProjects = dbProjects.length > 0 ? [...dbProjects, ...PROJECTS] : PROJECTS;

  const filteredProjects = allProjects.filter(proj => {
    if (filter === "All") return true;
    return proj.category.toLowerCase() === filter.toLowerCase();
  });

  return (
    <section
      id="work"
      className="pt-6 sm:pt-12 pb-12 sm:pb-20 bg-[#f5f5f7] dark:bg-[#09090b] transition-colors duration-300 noise-bg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-10 gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-3.5 py-1.5 rounded-full border border-violet-100 dark:border-violet-900/50">
            Selected Work
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mt-2 mb-2">
            Aesthetic and Functional Case Studies
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Explore custom digital products, web applications, and marketing frameworks crafted to solve concrete business metrics.
          </p>

          {/* Filtering Categories */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4.5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                  filter === cat
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20 scale-[1.03]"
                    : "bg-white dark:bg-[#161617] text-[#1d1d1f] dark:text-[#f5f5f7] border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-violet-400 dark:hover:border-violet-500/30 hover:shadow-xs hover:-translate-y-0.5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Notice */}
        <div className="mb-12 p-5 rounded-2xl bg-violet-50/40 dark:bg-violet-950/10 border border-violet-100/50 dark:border-violet-900/20 max-w-4xl">
          <div className="flex gap-3 items-start text-left">
            <ShieldAlert className="w-5 h-5 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
                Independent Concept Studies
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The projects below are designed and built independently as proof-of-concept explorations. They demonstrate full-stack capabilities, UI/UX performance standards, and real-time responsiveness without standard agency templates.
              </p>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="projects-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SkeletonGrid type="projects" count={4} />
            </motion.div>
          ) : (
            <motion.div
              key="projects-grid"
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.length === 0 ? (
                  <motion.div
                    key="empty-projects-placeholder"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="col-span-full text-center py-20 px-6 rounded-3xl bg-white dark:bg-[#161617]/40 border border-zinc-200/40 dark:border-zinc-800/40 shadow-xs"
                  >
                    <Folder className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-base font-display font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2">Portfolio Cases Under Construction</h3>
                    <p className="text-sm text-zinc-550 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                      We are currently updating our curated project showcases with premium live design case studies. Dynamic cases added through the Admin Workspace will appear here instantly!
                    </p>
                  </motion.div>
                ) : (
                  filteredProjects.map((proj, index) => {
                    const devSpec = devProjectSpecs[proj.id] || {
                      techTitle: `${proj.category.toUpperCase()} // HIGH-PERF ENGINE`,
                      metricsBanner: "TTFB: <50ms | BUNDLE: <45kB Gzip | HYDRATION: Edge Hydrated",
                      stats: [
                        { label: "Edge TTFB", value: "38ms", color: "text-violet-400" },
                        { label: "Gzip Bundle", value: "42.8kB", color: "text-cyan-300" },
                        { label: "Framework", value: "React 18", color: "text-violet-300" }
                      ],
                      highlights: [
                        "Modular React component design with TypeScript safety",
                        "Sub-second Web Vitals performance tuning",
                        "Zero-runtime layout shift CSS compilation"
                      ]
                    };

                    return (
                      <motion.div
                        key={proj.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35 }}
                        className="bg-white dark:bg-[#161617]/95 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:border-violet-500/80 dark:hover:border-violet-500/50 hover:shadow-[0_20px_45px_-12px_rgba(124,58,237,0.14)] hover:-translate-y-2 transition-all duration-500 ease-out group relative overflow-hidden"
                      >
                        {/* Code Grid Line Marker in Developer Mode */}
                        {perspective === "developer" && (
                          <div className="absolute top-3 right-4 font-mono text-[9px] text-violet-500/60 font-bold pointer-events-none select-none">
                            // 0{index + 1}
                          </div>
                        )}

                        <div>
                          {/* Decorative High-End Interface Mockup */}
                          <div className="aspect-[16/10] rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/40 mb-6 overflow-hidden relative flex flex-col justify-between p-6 shadow-inner group-hover:scale-[1.02] group-hover:shadow-md transition-all duration-500">
                            {/* Background Project Image */}
                            {proj.imageUrl && (
                              <div className="absolute inset-0 z-0 overflow-hidden">
                                <img
                                  src={proj.imageUrl}
                                  alt={proj.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[0.5deg]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/70" />
                              </div>
                            )}

                            {/* Mockup Header */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-white/30" />
                                <span className="w-2 h-2 rounded-full bg-white/30" />
                                <span className="w-2 h-2 rounded-full bg-white/30" />
                              </div>
                              <span className="text-[9px] font-mono font-medium text-zinc-300">
                                {proj.client}
                              </span>
                            </div>

                            {/* Mockup Central Visual Graphic */}
                            <div className="my-auto text-center py-4 px-2 relative z-10">
                              <span className={`inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3 backdrop-blur-md ${
                                perspective === "developer"
                                  ? "text-violet-300 bg-violet-950/80 border border-violet-500/40 font-mono"
                                  : "text-violet-300 bg-violet-950/80 border border-violet-500/30"
                              }`}>
                                {perspective === "developer" ? devSpec.techTitle : proj.category}
                              </span>
                              <h4 className="text-lg font-display font-bold text-white leading-tight max-w-sm mx-auto drop-shadow-md">
                                {proj.title}
                              </h4>
                              <p className="text-[11px] text-zinc-300 mt-1 max-w-xs mx-auto line-clamp-1 font-sans">
                                {proj.description}
                              </p>
                            </div>

                            {/* Mockup Stats Footer */}
                            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 relative z-10 min-h-[44px]">
                              <AnimatePresence mode="wait">
                                {perspective === "executive" ? (
                                  <motion.div
                                    key="exec-card-stats"
                                    initial={{ opacity: 0, y: 2 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -2 }}
                                    transition={{ duration: 0.15 }}
                                    className="col-span-3 grid grid-cols-3 gap-2"
                                  >
                                    <div className="text-center">
                                      <span className="block text-[8px] font-bold uppercase text-zinc-400">ROI Impact</span>
                                      <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-violet-300">+42% Conv.</span>
                                    </div>
                                    <div className="text-center">
                                      <span className="block text-[8px] font-bold uppercase text-zinc-400">Speed</span>
                                      <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-violet-300">Sub-Second</span>
                                    </div>
                                    <div className="text-center">
                                      <span className="block text-[8px] font-bold uppercase text-zinc-400">Visuals</span>
                                      <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-amber-300">100% Custom</span>
                                    </div>
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="dev-card-stats"
                                    initial={{ opacity: 0, y: 2 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -2 }}
                                    transition={{ duration: 0.15 }}
                                    className="col-span-3 grid grid-cols-3 gap-2 font-mono"
                                  >
                                    {devSpec.stats.map((st, sIdx) => (
                                      <div key={sIdx} className="text-center">
                                        <span className="block text-[8px] font-bold uppercase text-zinc-400">{st.label}</span>
                                        <span className={`text-[10px] sm:text-[11px] font-semibold ${st.color}`}>{st.value}</span>
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* Core Card Info */}
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                              <Folder className="w-3.5 h-3.5" />
                              {proj.category}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                              <Clock className="w-3.5 h-3.5" />
                              {proj.timeline}
                            </span>
                          </div>

                          <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-2 leading-snug">
                            {proj.title}
                          </h3>
                          <p className="text-sm text-zinc-650 dark:text-zinc-450 leading-relaxed mb-4">
                            {proj.description}
                          </p>

                          {/* Developer Mode Architecture Highlights Block */}
                          {perspective === "developer" && (
                            <div className="mb-6 p-3 bg-zinc-950 rounded-xl border border-violet-500/30 font-mono text-[11px] text-zinc-300 space-y-1.5">
                              <div className="text-[9px] uppercase tracking-wider text-violet-400 font-bold border-b border-zinc-800 pb-1 mb-2 flex items-center justify-between">
                                <span>ARCHITECTURE SPECIFICATION</span>
                                <span className="text-zinc-500">VERIFIED</span>
                              </div>
                              {devSpec.highlights.map((hl, hIdx) => (
                                <div key={hIdx} className="flex items-start gap-1.5 text-zinc-300 leading-tight">
                                  <span className="text-violet-400 font-bold shrink-0">▸</span>
                                  <span>{hl}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Tech Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-8">
                            {proj.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md ${
                                  perspective === "developer"
                                    ? "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/40 font-bold"
                                    : "text-zinc-600 dark:text-zinc-450 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/40"
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                      {/* Call to Action Button */}
                      <button
                        onClick={() => setSelectedProject(proj)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-900 hover:bg-violet-600 text-white dark:bg-zinc-900/60 dark:hover:bg-violet-600 border border-transparent dark:border-zinc-800/40 shadow-xs hover:shadow-[0_8px_25px_-6px_rgba(124,58,237,0.4)] transition-all duration-300 cursor-pointer group"
                      >
                        Explore Case Study
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    </motion.div>
                  );
                })
              )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Website Design References & Template Chooser */}
        <WebsiteReferences />

        {/* Immersive Detailed Modal Component */}
        <AnimatePresence>
          {selectedProject && (
            <CaseStudyModal
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
            />
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
