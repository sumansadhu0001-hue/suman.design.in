import { useState, useEffect, useMemo } from "react";
import { 
  ArrowRight, ArrowUpRight, Sparkles, Code, ShieldCheck, 
  ShoppingBag, Activity, ChevronRight, Play, Eye, Layers, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePerspective } from "../context/PerspectiveContext";
import HeroAutotypingAccent from "./HeroAutotypingAccent";
import TrustProofBar from "./home/TrustProofBar";
import FeaturedWorkPreview from "./home/FeaturedWorkPreview";
import AgencyPhilosophy from "./home/AgencyPhilosophy";
import ServicesSnapshot from "./home/ServicesSnapshot";
import WorkflowProcess from "./home/WorkflowProcess";
import FinalCtaBanner from "./home/FinalCtaBanner";

interface HeroProps {
  setActivePage: (page: "home" | "services" | "work" | "pricing" | "contact") => void;
}

export default function Hero({ setActivePage }: HeroProps) {
  const { perspective } = usePerspective();

  // Page navigation helper
  const handlePageNavigate = (page: "home" | "services" | "work" | "pricing" | "contact") => {
    setActivePage(page);
    window.location.hash = `#${page}`;
    window.scrollTo({
      top: 0,
      behavior: "instant" as any
    });
  };

  // State for the custom "Living Assembly" canvas
  const [selectedProject, setSelectedProject] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [isAssembling, setIsAssembling] = useState<boolean>(false);

  // Auto-activate [ Blueprint Code ] tab when perspective switches to developer mode
  useEffect(() => {
    if (perspective === "developer") {
      setViewMode("code");
    } else {
      setViewMode("preview");
    }
  }, [perspective]);

  // Benchmarking demo state (Principle 2)
  const [benchmarkStatus, setBenchmarkStatus] = useState<"idle" | "running" | "completed">("idle");
  const [benchmarkProgress, setBenchmarkProgress] = useState(0);

  const startBenchmark = () => {
    if (benchmarkStatus === "running") return;
    setBenchmarkStatus("running");
    setBenchmarkProgress(0);
  };

  useEffect(() => {
    if (benchmarkStatus !== "running") return;
    const interval = setInterval(() => {
      setBenchmarkProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBenchmarkStatus("completed");
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [benchmarkStatus]);

  // Project data representing actual living client sites
  const projects = [
    {
      id: 0,
      name: "Zari & Silk",
      city: "Jaipur",
      category: "Bespoke Headless Commerce",
      tagline: "Heritage Lookbook Engine",
      statLabel: "Mobile Indexing",
      statValue: "98/100",
      imgSaffron: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
      imgIvory: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
      imgEmerald: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
      problem: "A luxury heritage fashion house whose intricate loom details and lookbook editorial designs were flattened by slow-loading, rigid templates.",
      solution: "We engineered a static lookbook interface layered with hardware-accelerated transitions, asynchronous product filtering, and direct stylist coordination gateways.",
      result: "Mobile load times plummeted to 0.7s, lookbook dwell time rose +140%, and direct digital consultations skyrocketed by +42% in month one.",
      stats: [
        { label: "Performance", value: "98/100" },
        { label: "Load Velocity", value: "0.7s" },
        { label: "Session Dwell", value: "+140%" }
      ]
    },
    {
      id: 1,
      name: "Royal Jodhpur",
      city: "Rajasthan",
      category: "Tactile Curated Showcase",
      tagline: "Artisanal Timber Slide",
      statLabel: "Qualified Leads",
      statValue: "12.8%",
      imgFinished: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
      imgRaw: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
      problem: "Artisanal teak woodworkers with premium tables represented by standard grids that washed out the raw lumber provenance and detailed carvings.",
      solution: "We designed an asymmetric, museum-grade grid gallery featuring high-res detail reveals and interactive comparative sliding components.",
      result: "Showroom booking requests increased by 55% in the first quarter, backed by a 12.8% direct lead submission rate.",
      stats: [
        { label: "Qualified Leads", value: "12.8%" },
        { label: "Showroom Booking", value: "+55%" },
        { label: "Asset Comp", value: "-60%" }
      ]
    },
    {
      id: 2,
      name: "Arogya Diagnostics",
      city: "Bengaluru",
      category: "Secure Clinical Telemetry",
      tagline: "Patient Portal & Spline Node",
      statLabel: "Queue Reduction",
      statValue: "-80%",
      problem: "Patients and medical staff frustrated by physical collection queues, slow PDF downloads, and interfaces failing accessibility guidelines.",
      solution: "Implemented a custom serverless document engine parsing clinical test values into clean, high-contrast, interactive telemetry splines.",
      result: "Physical front-desk queue lines reduced by 80%, laboratory throughput optimized, and WCAG accessibility reached 100%.",
      stats: [
        { label: "Saved Clinic Hours", value: "40h/wk" },
        { label: "Security Audit", value: "Passed" },
        { label: "WCAG Rating", value: "100%" }
      ]
    }
  ];

  // Specific states for active interactive elements inside mockups
  const [zariSwatch, setZariSwatch] = useState<"saffron" | "ivory" | "emerald">("saffron");
  const [zariAdded, setZariAdded] = useState(false);
  const [jodhpurPos, setJodhpurPos] = useState(50);
  
  // Interactive Telemetry Points
  const telemetryPoints = [
    { x: 10, y: 75, val: "13.2 g/dL", label: "Hemoglobin Node [HGB]" },
    { x: 30, y: 35, val: "5,800 /µL", label: "White Blood Cells [WBC]" },
    { x: 50, y: 85, val: "142,000 /µL", label: "Platelet Index [PLT]" },
    { x: 70, y: 25, val: "1.9 µIU/mL", label: "Thyroid Telemetry [TSH]" },
    { x: 90, y: 55, val: "99% SpO2", label: "Oxygen Node [O2]" }
  ];
  const [hoveredNode, setHoveredNode] = useState<typeof telemetryPoints[0] | null>(null);
  const [securityLogs, setSecurityLogs] = useState<string[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);

  const runTelemetryAudit = () => {
    if (isAuditing) return;
    setIsAuditing(true);
    setSecurityLogs(["Initializing node keys...", "Decrypting payload..."]);
    
    setTimeout(() => {
      setSecurityLogs(prev => [...prev, "AES-256 signature matched."]);
    }, 400);
    setTimeout(() => {
      setSecurityLogs(prev => [...prev, "WCAG 2.1 verified. Safe."]);
      setIsAuditing(false);
    }, 800);
  };

  // Trigger assembly visual flash when project changes
  const handleProjectSelect = (idx: number) => {
    setSelectedProject(idx);
    setIsAssembling(true);
    const timer = setTimeout(() => setIsAssembling(false), 600);
    return () => clearTimeout(timer);
  };

  const projectCodes = {
    0: `// Zari & Silk Lookbook Look & Feel Engine
import { motion } from "motion/react";
import { useState } from "react";

export function Lookbook({ clientPayload }) {
  const [swatch, setSwatch] = useState("saffron");
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="asymmetric-commerce-grid font-display"
    >
      <lookbook-frame 
        src={clientPayload[swatch].highResImage} 
        duration="0.7s" 
      />
      <meta-container>
        <typography level="display" tracking="tight">
          Jaipur Heritage Loom / Pure Silk
        </typography>
        <performance-index ttfb="0.7s" />
      </meta-container>
    </motion.div>
  );
}`,
    1: `// Royal Jodhpur Timber Split-Screen Slider
import { useSpring } from "motion/react";
import { useState } from "react";

export function TimberShowcase({ grainSpecs }) {
  const [sliderPos, setSliderPos] = useState(50);
  const dragSpring = useSpring(sliderPos, { damping: 40 });
  
  return (
    <div className="museum-grade-showcase select-none">
      <ComparisonSlider 
        position={dragSpring} 
        onChange={setSliderPos} 
        leftLabel="Raw Heartwood"
        rightLabel="Polished Mahogany"
      />
      <Telemetry rate="12.8% Conversion" />
    </div>
  );
}`,
    2: `// Arogya Spline Pulse & AES Decryption
import { useMemo } from "react";
import { SplineGraph } from "./spline";

export function SecureClinicalTelemetry({ recordStream }) {
  const secureData = useMemo(() => {
    return decryptData(recordStream.payload, AES_256);
  }, [recordStream]);
  
  return (
    <div className="secure-clinical-telemetry p-6 font-mono">
      <TelemetryGraph 
        points={secureData} 
        strokeWidth={2.5}
        glowColor="#8B5CF6" 
      />
      <SecurityBadge audit="Passed" wcag="100%" />
    </div>
  );
}`
  };

  return (
    <div className="bg-[#f5f5f7] dark:bg-[#070709] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      
      {/* SECTION 1: MASTERPIECE ASSEMBLY HERO */}
      <section className="relative min-h-0 lg:min-h-screen pt-4 sm:pt-6 lg:pt-12 pb-20 md:pb-16 flex flex-col justify-center overflow-hidden border-b border-zinc-200/50 dark:border-zinc-900/50">
        
        {/* Absolute ambient light constraints */}
        <div className="absolute top-12 left-1/4 w-[35rem] h-[35rem] rounded-full bg-violet-500/[0.02] dark:bg-violet-500/[0.005] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[40rem] h-[40rem] rounded-full bg-violet-600/[0.015] dark:bg-violet-600/[0.003] blur-[140px] pointer-events-none" />
 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Editorial Column */}
            <div className="lg:col-span-5 flex flex-col justify-center text-left">
              
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2.5 mb-4 lg:mb-6 min-h-[20px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-pulse shrink-0" />
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={perspective}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="font-mono text-[clamp(9px,2vw,10px)] uppercase tracking-[0.2em] text-zinc-750 dark:text-zinc-200 font-bold"
                  >
                    {perspective === "executive" 
                      ? "BESPOKE DIGITAL STUDIO // HIGH-CONVERTING WEB EXPERIENCES"
                      : "SYSTEM ARCHITECTURE // NEXT.JS 14 APP ROUTER • SSR + ISR • EDGE-DEPLOYED"
                    }
                  </motion.span>
                </AnimatePresence>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
                className="text-[clamp(2.1rem,7vw,4.2rem)] sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white leading-[1.08] mb-5 lg:mb-7"
              >
                <span className="block">We build websites</span>
                <HeroAutotypingAccent perspective={perspective} />
                <span className="block">deserves to stand on.</span>
              </motion.h1>

              <div className="min-h-[72px] mb-6 lg:mb-8">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={perspective}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="text-[clamp(0.88rem,3vw,1.02rem)] sm:text-base font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans max-w-lg"
                  >
                    {perspective === "executive"
                      ? "An independent digital studio building custom, ultra-fast websites that elevate your brand image, load instantly, and turn visitors into paying clients."
                      : "Zero-dependency frontend architecture engineered from first principles. Built with Next.js Server Components, edge-cached dynamic hydration, and atomic CSS compiling for sub-100ms LCP and 0.00 CLS."
                    }
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* CTAs */}
              <motion.div 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}
                className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full mb-6 lg:mb-8"
              >
                <button
                  onClick={() => handlePageNavigate("contact")}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs lg:text-xs font-bold uppercase tracking-wider text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 border border-transparent rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer shadow-md shadow-violet-600/20"
                >
                  Initiate Project
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => handlePageNavigate("work")}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs lg:text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white bg-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl lg:rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                >
                  Explore Studies
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </motion.div>

              {/* Status and Tech Tags */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="flex flex-col gap-2.5 text-zinc-500 dark:text-zinc-400 font-mono text-[9px] sm:text-[10px] pb-10 lg:pb-0"
              >
                <div className="flex gap-1.5 items-center whitespace-nowrap text-[9px] sm:text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse shrink-0" />
                  <span className="uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300">Q3 Capacity:</span>
                  <span>1 Active Slot Available</span>
                </div>

                <div className="pt-2 border-t border-zinc-200/40 dark:border-zinc-850/50">
                  <AnimatePresence mode="wait">
                    {perspective === "executive" ? (
                      <motion.div
                        key="exec-badges"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-nowrap sm:flex-wrap overflow-x-auto no-scrollbar gap-1 sm:gap-1.5 pb-0.5"
                      >
                        {["React 18", "TypeScript", "Tailwind CSS", "Next.js", "WCAG 100% AA"].map((tag, i) => (
                          <span key={i} className="text-[8px] sm:text-[9px] font-mono font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-900/80 px-1.5 sm:px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800/50 whitespace-nowrap shrink-0">
                            {tag}
                          </span>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="dev-badges"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-nowrap sm:flex-wrap overflow-x-auto no-scrollbar gap-1 sm:gap-1.5 pb-0.5"
                      >
                        {[
                          "React 18 RSC",
                          "TypeScript ES2023",
                          "Tailwind JIT",
                          "Next.js 14 Edge",
                          "WCAG 2.1 AA"
                        ].map((tag, i) => (
                          <span key={i} className="text-[8px] sm:text-[9px] font-mono font-bold text-violet-700 dark:text-violet-300 bg-violet-50/80 dark:bg-violet-950/60 px-1.5 sm:px-2 py-0.5 rounded border border-violet-200/60 dark:border-violet-800/60 whitespace-nowrap shrink-0">
                            {tag}
                          </span>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

            </div>

            {/* Right Interactive Assembly Column */}
            <div className="lg:col-span-7 w-full mt-2 lg:-mt-2">
              <motion.div 
                id="living-portfolio-deck"
                initial={{ opacity: 0, scale: 0.98, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
                className="w-full rounded-3xl bg-white dark:bg-[#0c0c0e] border border-zinc-200/80 dark:border-zinc-900 shadow-2xl shadow-violet-500/10 dark:shadow-violet-950/20 overflow-hidden flex flex-col min-h-[460px] lg:min-h-[480px] animate-float transform-gpu will-change-transform"
              >
                
                {/* Visual Header / IDE Tab Deck */}
                <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 border-b border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/20" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/20" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/20" />
                    <span className="hidden min-[400px]:inline-block text-[10px] font-mono text-zinc-400 dark:text-zinc-500 ml-2 tracking-widest uppercase">
                      Living_Portfolio_v1.0
                    </span>
                  </div>

                  {/* Toggle Preview vs Code */}
                  <div className="flex bg-zinc-200/60 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200/10">
                    <button
                      onClick={() => setViewMode("preview")}
                      className={`px-3 py-1 text-[9px] font-mono uppercase tracking-widest rounded-md transition-all cursor-pointer ${
                        viewMode === "preview"
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-xs"
                          : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200"
                      }`}
                    >
                      Live Preview
                    </button>
                    <button
                      onClick={() => setViewMode("code")}
                      className={`px-3 py-1 text-[9px] font-mono uppercase tracking-widest rounded-md transition-all cursor-pointer ${
                        viewMode === "code"
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-xs"
                          : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200"
                      }`}
                    >
                      Blueprint Code
                    </button>
                  </div>
                </div>

                {/* Main Client Tabs */}
                <div className="flex border-b border-zinc-150 dark:border-zinc-900/60 bg-white dark:bg-[#0c0c0e] overflow-x-auto select-none">
                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => handleProjectSelect(proj.id)}
                      className={`flex-1 min-w-[90px] lg:min-w-[120px] py-2.5 lg:py-3.5 px-2 lg:px-4 text-center border-b-2 text-[10px] lg:text-xs transition-all relative cursor-pointer ${
                        selectedProject === proj.id
                          ? "border-b-violet-500 text-zinc-950 dark:text-white font-bold bg-zinc-50/20 dark:bg-zinc-950/10"
                          : "border-b-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {selectedProject === proj.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                        )}
                        <span className="font-mono tracking-wide">{proj.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Master Render Canvas */}
                <div className="flex-1 p-2 lg:p-8 flex flex-col justify-center relative bg-zinc-50/10 dark:bg-zinc-950/5 overflow-hidden">
                  
                  {/* Flashing Code Assembly Transition Overlay */}
                  <AnimatePresence mode="wait">
                    {isAssembling ? (
                      <motion.div
                        key="assembling-framer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#070709] z-20 flex flex-col justify-center p-6 font-mono text-[10px] text-zinc-400 overflow-hidden select-none"
                      >
                        <div className="max-w-md mx-auto space-y-1.5 w-full">
                          <p className="text-violet-400 animate-pulse">// Compiling dynamic DOM node hierarchy...</p>
                          <p className="opacity-80">const project = database.find(p =&gt; p.name === "{projects[selectedProject].name}");</p>
                          <p className="opacity-60">import {`{ Lookbook }`} from "@/components/assembly";</p>
                          <p className="opacity-40">const root = createRoot(document.getElementById("live-root"));</p>
                          <p className="text-violet-400 opacity-90">Ready: {projects[selectedProject].category} loaded nominal.</p>
                        </div>
                      </motion.div>
                    ) : null}
                  </  AnimatePresence>

                  <AnimatePresence mode="wait">
                    {viewMode === "code" ? (
                      // Syntax Highlighted IDE View
                      <motion.div
                        key={`code-${selectedProject}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="w-full font-mono text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500 bg-zinc-950/90 p-5 rounded-2xl border border-zinc-900/60 overflow-y-auto max-h-[300px] text-left"
                      >
                        <pre className="whitespace-pre-wrap">
                          {projectCodes[selectedProject as keyof typeof projectCodes]}
                        </pre>
                      </motion.div>
                    ) : (
                      // Live Interactive Simulated Previews
                      <motion.div
                        key={`preview-${selectedProject}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="w-full flex justify-center"
                      >
                        
                        {/* CASE 0: Zari & Silk Lookbook Experience */}
                        {selectedProject === 0 && (
                          <div className={`w-full max-w-none sm:max-w-sm rounded-2xl border transition-all duration-300 p-4 lg:p-5 bg-white shadow-lg ${
                            zariSwatch === "saffron" ? "border-amber-200/50 dark:bg-zinc-950 dark:border-amber-950/20" :
                            zariSwatch === "emerald" ? "border-emerald-200/50 dark:bg-zinc-950 dark:border-emerald-950/20" :
                            "border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800/80"
                          }`}>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[8px] font-mono tracking-widest text-zinc-400 uppercase font-bold">
                                ZARI_SILK_BOUTIQUE
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-mono text-zinc-500">0.7S VELOCITY</span>
                              </div>
                            </div>

                            {/* Main Lookbook Product Showcase Card */}
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-4 border border-zinc-100 dark:border-zinc-900/60 group">
                              <img 
                                src={
                                  zariSwatch === "saffron" ? projects[0].imgSaffron :
                                  zariSwatch === "emerald" ? projects[0].imgEmerald :
                                  projects[0].imgIvory
                                } 
                                alt="Heritage Fashion Look" 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                              <span className="absolute bottom-3 left-3 text-[10px] font-mono text-white bg-black/45 px-2.5 py-1 rounded backdrop-blur-xs uppercase tracking-widest">
                                {zariSwatch} Bloom Look
                              </span>
                            </div>

                            {/* Swatch Selectors */}
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <span className="block text-[8px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Select Loom Color</span>
                                <div className="flex gap-2">
                                  {(["saffron", "ivory", "emerald"] as const).map(sw => (
                                    <button
                                      key={sw}
                                      onClick={() => setZariSwatch(sw)}
                                      className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${
                                        sw === "saffron" ? "bg-[#e28743]" :
                                        sw === "ivory" ? "bg-[#eae6df]" : "bg-[#1f4e3c]"
                                      } ${
                                        zariSwatch === sw 
                                          ? "border-violet-600 scale-110 shadow-sm" 
                                          : "border-transparent hover:scale-105"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block text-[8px] font-mono text-zinc-400 uppercase tracking-wider mb-0.5">TTFB (Jaipur Edge)</span>
                                <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">0.7s OK</span>
                              </div>
                            </div>

                            {/* Interactive Buy Stack */}
                            <div className="flex gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-900/80">
                              <button
                                onClick={() => {
                                  setZariAdded(true);
                                  setTimeout(() => setZariAdded(false), 1800);
                                }}
                                className="flex-1 py-2 rounded-xl text-[9px] font-mono uppercase tracking-widest font-bold bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 transition-all cursor-pointer shadow-sm active:scale-98"
                              >
                                {zariAdded ? "Added to Stack!" : "Assemble Look"}
                              </button>
                              <div className="bg-zinc-50 dark:bg-zinc-900/60 px-3 flex items-center justify-center rounded-xl border border-zinc-150 dark:border-zinc-900">
                                <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400">+42%</span>
                              </div>
                            </div>

                          </div>
                        )}

                        {/* CASE 1: Royal Jodhpur Sliding Craftsmanship */}
                        {selectedProject === 1 && (
                          <div className="w-full max-w-none sm:max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-lg p-4 lg:p-5">
                            <div className="flex items-center justify-between mb-3 lg:mb-4">
                              <span className="text-[8px] font-mono tracking-widest text-zinc-400 uppercase font-bold">
                                JODHPUR_WOODWORKS
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[8px] font-mono text-zinc-500">MUSEUM_SPLIT</span>
                              </div>
                            </div>

                            {/* Interactive Clip-Path Comparison Stage */}
                            <div className="relative h-32 lg:h-44 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-900 mb-3 lg:mb-4 select-none">
                              
                              {/* Layer 1: Finished Polish (Right Background) */}
                              <img 
                                src={projects[1].imgFinished} 
                                alt="Finished Timber Wood" 
                                referrerPolicy="no-referrer"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/10" />
                              <div className="absolute bottom-3 right-3 text-[8px] font-mono text-white bg-black/60 px-2.5 py-1 rounded backdrop-blur-xs uppercase z-10">
                                02 / POLISHED TEAK
                              </div>

                              {/* Layer 2: Raw Woodgrain Blueprint (Left Overlapping Clip) */}
                              <div 
                                className="absolute inset-0 z-10 overflow-hidden border-r-2 border-amber-500/80 shadow-[2px_0_10px_rgba(245,158,11,0.2)]"
                                style={{ clipPath: `polygon(0 0, ${jodhpurPos}% 0, ${jodhpurPos}% 100%, 0 100%)` }}
                              >
                                <img 
                                  src={projects[1].imgRaw} 
                                  alt="Raw Woodgrain timber" 
                                  referrerPolicy="no-referrer"
                                  className="absolute inset-0 w-full h-full object-cover filter grayscale brightness-60"
                                />
                                {/* Cool vector overlays on raw woodgrain */}
                                <div className="absolute inset-0 bg-[#070709]/30" />
                                <div className="absolute top-4 left-4 font-mono text-[7px] text-amber-400 leading-normal bg-black/65 p-2 rounded border border-amber-500/20 max-w-[120px]">
                                  <p className="font-bold border-b border-amber-500/20 pb-0.5 mb-1 text-[8px]">CORE PATTERN</p>
                                  <p>TEAK GRAIN: FINE</p>
                                  <p>DENSITY: 720 KG/M³</p>
                                </div>
                                <div className="absolute bottom-3 left-3 text-[8px] font-mono text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-500/20 uppercase">
                                  01 / RAW HARVEST
                                </div>
                              </div>

                            </div>

                            {/* Split-Screen Range Slider Control */}
                            <div className="space-y-3 mb-1">
                              <div className="flex justify-between items-center text-[8px] font-mono text-zinc-400 uppercase tracking-widest">
                                <span>Adjust Grain Split</span>
                                <span className="text-amber-500 font-bold">{jodhpurPos}% Reveal</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={jodhpurPos} 
                                onChange={(e) => setJodhpurPos(Number(e.target.value))}
                                className="w-full h-1.5 bg-zinc-150 dark:bg-zinc-900 rounded-lg appearance-none cursor-ew-resize accent-amber-500 focus:outline-none" 
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/80">
                              <div>
                                <span className="block text-[8px] font-mono text-zinc-400 uppercase tracking-wider mb-0.5">Showroom Visits</span>
                                <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white">+55% Lift</span>
                              </div>
                              <div className="text-right">
                                <span className="block text-[8px] font-mono text-zinc-400 uppercase tracking-wider mb-0.5">Qualified Leads</span>
                                <span className="text-sm font-mono font-bold text-violet-600 dark:text-violet-400">12.8% Ratio</span>
                              </div>
                            </div>

                          </div>
                        )}

                        {/* CASE 2: Arogya Diagnostic Spline & Encrypted Node */}
                        {selectedProject === 2 && (
                          <div className="w-full max-w-none sm:max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#09090b] shadow-lg p-4 lg:p-5">
                            <div className="flex items-center justify-between mb-3 lg:mb-4">
                              <span className="text-[8px] font-mono tracking-widest text-zinc-400 uppercase font-bold">
                                AROGYA_TELEMETRY_ENGINE
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                                <span className="text-[8px] font-mono text-zinc-500">LIVE_PULSE_NODE</span>
                              </div>
                            </div>

                            {/* SVG Glowing spline chart */}
                            <div className="relative bg-zinc-950 rounded-xl p-3 border border-zinc-900 mb-3 lg:mb-4 overflow-hidden h-24 lg:h-28 flex flex-col justify-center select-none">
                              
                              {/* Grid lines inside chart */}
                              <div className="absolute inset-0 grid grid-cols-5 opacity-[0.03] pointer-events-none">
                                <div className="border-r border-white h-full" />
                                <div className="border-r border-white h-full" />
                                <div className="border-r border-white h-full" />
                                <div className="border-r border-white h-full" />
                              </div>

                              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible z-10">
                                <defs>
                                  <linearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.8" />
                                  </linearGradient>
                                </defs>

                                {/* Dynamic Gradient fill path */}
                                <path 
                                  d="M 10 75 Q 20 35 30 35 T 50 85 T 70 25 T 90 55 L 90 100 L 10 100 Z" 
                                  fill="url(#glowGrad)" 
                                  className="opacity-20"
                                />

                                {/* Spline Line */}
                                <path 
                                  d="M 10 75 Q 20 35 30 35 T 50 85 T 70 25 T 90 55" 
                                  fill="none" 
                                  stroke="#8B5CF6" 
                                  strokeWidth="2.5" 
                                  strokeLinecap="round"
                                />

                                {/* Active telemetry points */}
                                {telemetryPoints.map((pt, idx) => (
                                  <circle 
                                    key={idx}
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={hoveredNode?.x === pt.x ? "4" : "2.5"}
                                    fill={hoveredNode?.x === pt.x ? "#fff" : "#8B5CF6"}
                                    stroke="#7C3AED"
                                    strokeWidth="1.5"
                                    className="cursor-pointer transition-all duration-150"
                                    onMouseEnter={() => setHoveredNode(pt)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                  />
                                ))}

                                {/* Dotted vertical cursor tracker line */}
                                {hoveredNode && (
                                  <line 
                                    x1={hoveredNode.x} 
                                    y1="0" 
                                    x2={hoveredNode.x} 
                                    y2="100" 
                                    stroke="#8B5CF6" 
                                    strokeDasharray="2,2" 
                                    strokeWidth="0.8"
                                    className="opacity-50"
                                  />
                                )}
                              </svg>

                              {/* Hover interactive overlay tooltip */}
                              {hoveredNode && (
                                <div className="absolute top-2 right-2 bg-black/85 text-white p-2 rounded border border-violet-500/30 text-[8px] font-mono leading-none z-20 shadow-lg">
                                  <p className="font-bold text-violet-400 uppercase tracking-widest">{hoveredNode.label}</p>
                                  <p className="mt-1 text-[10px]">{hoveredNode.val}</p>
                                </div>
                              )}
                            </div>

                            {/* Telemetry Logger and security auditor */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1 text-left">
                                <span className="block text-[8px] font-mono text-zinc-400 uppercase tracking-widest mb-1">
                                  Clinical Audit Output
                                </span>
                                {securityLogs.length === 0 ? (
                                  <span className="text-[9px] font-mono text-zinc-500">Telemetry engine listening nominal...</span>
                                ) : (
                                  <div className="space-y-0.5 text-[8px] font-mono text-violet-600 dark:text-violet-400 bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-200/40 dark:border-zinc-900">
                                    {securityLogs.map((log, lIdx) => (
                                      <p key={lIdx}>&gt; {log}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button 
                                onClick={runTelemetryAudit}
                                disabled={isAuditing}
                                className="ml-3 px-2.5 py-1 text-[8px] font-mono bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-white rounded border border-zinc-200/10 uppercase tracking-wider shrink-0 cursor-pointer disabled:opacity-50 transition-colors"
                              >
                                {isAuditing ? "Running..." : "Audit SSL"}
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900/80">
                              <div>
                                <span className="block text-[8px] font-mono text-zinc-400 uppercase tracking-wider mb-0.5">Queue Redux</span>
                                <span className="text-xs font-mono font-bold text-emerald-500">-80% Saved</span>
                              </div>
                              <div className="text-right">
                                <span className="block text-[8px] font-mono text-zinc-400 uppercase tracking-wider mb-0.5">WCAG Rating</span>
                                <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">100% Passed</span>
                              </div>
                            </div>

                          </div>
                        )}

                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Bottom Stats / Case Study Description Bar */}
                <div className="p-4 lg:p-6 border-t border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/30 text-left">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <span className="block text-[8px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
                        {projects[selectedProject].category}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-none">
                        {projects[selectedProject].tagline}
                      </h4>
                    </div>
                    <div className="flex gap-4 shrink-0 font-mono text-xs">
                      <div>
                        <span className="block text-[8px] text-zinc-400 uppercase mb-0.5">Outcome</span>
                        <span className="font-bold text-violet-600 dark:text-violet-300">
                          {projects[selectedProject].statValue}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
                      <div>
                        <span className="block text-[8px] text-zinc-400 uppercase mb-0.5">Scope</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          Production
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: VERIFIED PARTNERS STRIP */}
      <section className="py-8 bg-white dark:bg-[#09090b] border-b border-zinc-200/40 dark:border-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 font-bold block">
              VERIFIED CLIENTS & REALIZED OUTCOMES
            </span>
            <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center items-center text-xs font-mono text-zinc-400 dark:text-zinc-500">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    handleProjectSelect(proj.id);
                    const el = document.getElementById("living-portfolio-deck");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className={`flex items-center gap-2 group cursor-pointer text-left transition-all px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/80 ${
                    selectedProject === proj.id ? "bg-violet-50/80 dark:bg-violet-950/30" : ""
                  }`}
                  title={`View ${proj.name} live interactive mockup`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-transform ${
                    selectedProject === proj.id ? "bg-violet-600 scale-125" : "bg-violet-500/80 group-hover:bg-violet-600"
                  }`} />
                  <span className={`font-bold transition-colors ${
                    selectedProject === proj.id ? "text-violet-600 dark:text-violet-400" : "text-zinc-700 dark:text-zinc-300 group-hover:text-violet-600 dark:group-hover:text-violet-400"
                  }`}>{proj.name}</span>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200/40 dark:border-zinc-800/40">{proj.statValue}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  handleProjectSelect(0);
                  const el = document.getElementById("living-portfolio-deck");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="flex items-center gap-2 group cursor-pointer text-left transition-all px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/80"
                title="View Araku Valley Coffee case"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500/80 group-hover:bg-violet-600" />
                <span className="font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-violet-600 dark:group-hover:text-violet-400">Araku Valley Coffee</span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200/40 dark:border-zinc-800/40">Pre-orders</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUST & PROOF BAR */}
      <TrustProofBar />

      {/* SECTION 3: FEATURED WORK TEASER */}
      <FeaturedWorkPreview setActivePage={setActivePage} />

      {/* SECTION 4: AGENCY PHILOSOPHY */}
      <AgencyPhilosophy />

      {/* SECTION 5: SERVICES SNAPSHOT */}
      <ServicesSnapshot setActivePage={setActivePage} />

      {/* SECTION 6: WORKFLOW PROCESS */}
      <WorkflowProcess />

      {/* SECTION 7: FINAL CTA BANNER */}
      <FinalCtaBanner setActivePage={setActivePage} />

    </div>
  );
}
