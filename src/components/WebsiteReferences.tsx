import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Layers, Check, MousePointerClick, Monitor, Sparkles, Eye, ArrowRight, Sun, Moon } from "lucide-react";

interface StyleRef {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  tags: string[];
  vibe: string;
  typography: string;
  accentColor: string;
  bestFor: string;
  imageUrl: string;
  miniMockup: {
    heroTitle: string;
    heroSubtitle: string;
    theme: "light" | "dark" | "both";
  };
}

const STYLE_REFS: StyleRef[] = [
  {
    id: "minimalist-apple",
    name: "Sleek Minimalist",
    subtitle: "Apple & Linear Aesthetic",
    description: "Ultra-thin gray borders, ample whitespace, fine monospaced elements, and sleek transitions. Focuses entirely on photography and pure typographic hierarchy.",
    tags: ["SaaS Platforms", "Fintech Apps", "Design Agencies", "Creators"],
    vibe: "High-Tech, Premium, Precise, Clean",
    typography: "Inter Sans + Space Grotesk Headings",
    accentColor: "indigo",
    bestFor: "Software startups and design consultancies wishing to build absolute premium trust.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    miniMockup: {
      heroTitle: "Precision meets design.",
      heroSubtitle: "A revolutionary interface engineered for high-performance builders. Crafted in silver and charcoal.",
      theme: "dark"
    }
  },
  {
    id: "bold-editorial",
    name: "Bold Editorial",
    subtitle: "Vogue & Swiss Design",
    description: "High-contrast layouts, large serif display typography, asymmetrical grids, and premium brand storytelling. Best for physical crafts, luxury textiles, and premium fashion.",
    tags: ["Boutiques", "Architects", "Luxury Fashion", "Art Studios"],
    vibe: "Elegant, Artistic, Confident, Timeless",
    typography: "Playfair Display Serif + Inter Sans",
    accentColor: "amber",
    bestFor: "Artisanal builders, high-end realtors, and luxury fashion houses aiming to project timeless prestige.",
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
    miniMockup: {
      heroTitle: "The Art of Living Wood.",
      heroSubtitle: "Handcrafted Jodhpur teak furniture curated with modern architectural aesthetics in mind.",
      theme: "light"
    }
  },
  {
    id: "modern-bento",
    name: "Interactive Bento Grid",
    subtitle: "Modern Dashboard Layout",
    description: "Highly structured bento boxes of varying sizes with subtle hover lifting, interactive visual counters, and dynamic hover effects.",
    tags: ["E-Commerce Catalogs", "Tech Startups", "Analytics", "Portfolios"],
    vibe: "Structured, Functional, Playful, Dense",
    typography: "Outfit Sans + Fira Code Mono",
    accentColor: "violet",
    bestFor: "Data-driven applications, service portfolios, and e-commerce platforms wishing to display feature richness.",
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    miniMockup: {
      heroTitle: "Zero Complexity. All Data.",
      heroSubtitle: "Track diagnostic metrics and medical report history with real-time updates inside neat cards.",
      theme: "dark"
    }
  },
  {
    id: "warm-organic",
    name: "Warm Artisanal",
    subtitle: "Clay & Eco-Organic Vibe",
    description: "Soft off-white and warm cream backgrounds, organic rounded cards, earthy terracotta and sage-green tones, and luxurious serif subheads.",
    tags: ["Specialty Cafes", "Wellness Spas", "Eco Brands", "Boutique Stays"],
    vibe: "Cosy, Trusted, Grounded, Organic",
    typography: "Fraunces Serif + Plus Jakarta Sans",
    accentColor: "emerald",
    bestFor: "Artisanal cafes, organic wellness centers, boutique hospitality brands, and earthy startups.",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    miniMockup: {
      heroTitle: "Roasted in the Valley.",
      heroSubtitle: "Sustainably sourced single-origin coffee beans from the misty slopes of Araku Valley.",
      theme: "light"
    }
  }
];

export default function WebsiteReferences() {
  const [selectedRef, setSelectedRef] = useState<StyleRef>(STYLE_REFS[0]);
  const [localTheme, setLocalTheme] = useState<"light" | "dark">("dark");
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const handleSelectStyle = (style: StyleRef) => {
    // Save to local storage
    localStorage.setItem("selected_style", style.name);
    
    // Dispatch custom event to notify contact form
    window.dispatchEvent(new CustomEvent("style_selected", { detail: style.name }));

    // Show beautiful success banner
    setCopiedNotification(style.name);
    setTimeout(() => {
      setCopiedNotification(null);
    }, 4000);

    // Smoothly scroll to contact form
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="mt-24 pt-16 border-t border-zinc-200/60 dark:border-zinc-800/60 text-left">
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-3.5 py-1.5 rounded-full border border-violet-100 dark:border-violet-900/50">
          Design Discovery
        </span>
        <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mt-4 mb-4">
          Choose Your Website Style Reference
        </h2>
        <p className="text-zinc-650 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
          Not sure what design language fits your brand? Click and preview our custom curated layout style blueprints. Choose one to prefill your project parameters instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Style Chooser Navigation Panels */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {STYLE_REFS.map((style) => {
            const isSelected = selectedRef.id === style.id;
            return (
              <button
                key={style.id}
                onClick={() => {
                  setSelectedRef(style);
                  if (style.miniMockup.theme === "dark") {
                    setLocalTheme("dark");
                  } else {
                    setLocalTheme("light");
                  }
                }}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-white dark:bg-[#161617]/95 border-violet-500 shadow-lg ring-1 ring-violet-500/25"
                    : "bg-white/40 dark:bg-[#161617]/20 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-[#161617]/60 hover:border-violet-400/80 dark:hover:border-violet-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/5"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-violet-500/10 to-transparent pointer-events-none rounded-tr-2xl" />
                )}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-550">
                      {style.subtitle}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                        Active Selection
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-display font-bold text-zinc-900 dark:text-white">
                    {style.name}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {style.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {style.tags.slice(0, 2).map((tg) => (
                    <span
                      key={tg}
                      className="text-[9px] font-mono font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded"
                    >
                      {tg}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Interactive Style Preview Frame */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#161617]/95 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl overflow-hidden flex flex-col h-[460px] sm:h-[520px]">
            {/* Mock browser header frame */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>

              {/* Dynamic URL address box */}
              <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-white dark:bg-zinc-950/80 border border-zinc-200/45 dark:border-zinc-800/80 rounded-lg text-[10px] font-mono text-zinc-400 dark:text-zinc-500 w-52 sm:w-72 truncate select-none shadow-inner">
                <Monitor className="w-3 h-3 opacity-60" />
                <span>reference://styles/{selectedRef.id}</span>
              </div>

              {/* Theme toggle for reference simulation */}
              <button
                onClick={() => setLocalTheme(prev => prev === "light" ? "dark" : "light")}
                className="p-1 rounded-md text-zinc-400 dark:text-zinc-500 hover:text-violet-500 dark:hover:text-violet-400 bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-850/60 shadow-sm cursor-pointer"
                title="Toggle Live Style Theme"
              >
                {localTheme === "light" ? (
                  <Moon className="w-3.5 h-3.5" />
                ) : (
                  <Sun className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Simulated Live Canvas Container */}
            <div
              className={`flex-1 p-6 sm:p-8 overflow-y-auto transition-all duration-300 relative flex flex-col justify-between ${
                localTheme === "light"
                  ? "bg-zinc-50 text-[#1d1d1f]"
                  : "bg-zinc-950 text-[#f5f5f7]"
              }`}
            >
              {/* Background Mockup Image Overlay for real landing page atmosphere */}
              {selectedRef.imageUrl && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                  <img
                    src={selectedRef.imageUrl}
                    alt={selectedRef.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-[0.25] dark:opacity-[0.22] transition-opacity duration-500 blur-[2px]"
                  />
                  <div className={`absolute inset-0 ${
                    localTheme === "light"
                      ? "bg-gradient-to-b from-zinc-50/80 via-zinc-50/70 to-zinc-50/85"
                      : "bg-gradient-to-b from-zinc-950/85 via-zinc-950/80 to-zinc-950/90"
                  }`} />
                </div>
              )}

              {/* Layout Content */}
              <div className="relative z-10">
                {/* Style Indicator */}
                <div className="flex justify-between items-start mb-6">
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border ${
                    localTheme === "light"
                      ? "bg-zinc-100 border-zinc-200 text-zinc-500"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400"
                  }`}>
                    Layout Schema: {selectedRef.name}
                  </span>
                  <div className="flex gap-1.5 text-[8px] font-mono text-zinc-400">
                    <span>Accent:</span>
                    <span className={`w-3.5 h-3.5 rounded-full inline-block ${
                      selectedRef.accentColor === "indigo" ? "bg-indigo-500" :
                      selectedRef.accentColor === "amber" ? "bg-amber-500" :
                      selectedRef.accentColor === "violet" ? "bg-violet-500" : "bg-emerald-500"
                    }`} />
                  </div>
                </div>

                {/* Simulated Content rendering based on Selected Blueprint style */}
                {selectedRef.id === "minimalist-apple" && (
                  <motion.div
                    key="minimalist"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 text-left"
                  >
                    <div className="space-y-2">
                      <h1 className="text-3xl font-display font-medium tracking-tight font-sans">
                        {selectedRef.miniMockup.heroTitle}
                      </h1>
                      <p className="text-xs text-zinc-500 max-w-sm leading-relaxed font-sans">
                        {selectedRef.miniMockup.heroSubtitle}
                      </p>
                    </div>

                    {/* Clean Minimalist Cards */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className={`p-4 rounded-lg border text-left ${
                        localTheme === "light" ? "bg-white border-zinc-200" : "bg-[#111] border-zinc-850"
                      }`}>
                        <span className="text-[9px] font-mono text-zinc-400 block mb-1">METRIC 01</span>
                        <span className="text-lg font-bold font-mono text-indigo-500">99.8%</span>
                        <p className="text-[10px] text-zinc-500 mt-1">Uptime benchmark guaranteed.</p>
                      </div>
                      <div className={`p-4 rounded-lg border text-left ${
                        localTheme === "light" ? "bg-white border-zinc-200" : "bg-[#111] border-zinc-850"
                      }`}>
                        <span className="text-[9px] font-mono text-zinc-400 block mb-1">LATENCY</span>
                        <span className="text-lg font-bold font-mono text-zinc-400">0.3s</span>
                        <p className="text-[10px] text-zinc-500 mt-1">Response speed optimization.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedRef.id === "bold-editorial" && (
                  <motion.div
                    key="editorial"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 text-left"
                  >
                    <div className="space-y-3">
                      <h1 className="text-4xl font-serif font-semibold tracking-wide italic leading-tight">
                        {selectedRef.miniMockup.heroTitle}
                      </h1>
                      <div className="w-16 h-0.5 bg-amber-500" />
                      <p className="text-xs text-zinc-500 max-w-sm leading-relaxed font-sans font-medium">
                        {selectedRef.miniMockup.heroSubtitle}
                      </p>
                    </div>

                    {/* Classic layout row */}
                    <div className="flex gap-4 items-center pt-2">
                      <div className={`w-20 h-24 rounded border flex items-center justify-center relative overflow-hidden ${
                        localTheme === "light" ? "bg-zinc-200 border-zinc-300" : "bg-zinc-900 border-zinc-800"
                      }`}>
                        <span className="text-[9px] font-serif text-zinc-400 italic">Illustration</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono uppercase text-zinc-400">ESTABLISHED</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Jaipur Heritage wood</h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed max-w-xs">Each segment carries certified heritage and seasoned teak guarantees.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedRef.id === "modern-bento" && (
                  <motion.div
                    key="bento"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 text-left"
                  >
                    <div className="space-y-1">
                      <h1 className="text-xl font-bold font-sans tracking-tight text-violet-500 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Interactive Dashboard
                      </h1>
                      <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                        {selectedRef.miniMockup.heroSubtitle}
                      </p>
                    </div>

                    {/* Bento boxes */}
                    <div className="grid grid-cols-12 gap-3 pt-2">
                      <div className={`col-span-8 p-3 rounded-xl border flex flex-col justify-between ${
                        localTheme === "light" ? "bg-white border-zinc-200" : "bg-[#161617] border-zinc-800"
                      }`}>
                        <span className="text-[9px] font-mono text-zinc-400">DAILY VOLUME</span>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-xl font-bold font-mono">14,204</span>
                          <span className="text-[9px] font-mono text-emerald-500">+12%</span>
                        </div>
                      </div>
                      <div className="col-span-4 rounded-xl bg-violet-600 p-3 text-white flex flex-col justify-between hover:bg-violet-700 transition-colors cursor-pointer shadow-md">
                        <span className="text-[8px] font-mono opacity-80 block text-right">ACTION</span>
                        <span className="text-sm font-bold block mt-3">Sync Link</span>
                      </div>
                      <div className={`col-span-4 p-3 rounded-xl border flex flex-col justify-center text-center ${
                        localTheme === "light" ? "bg-white border-zinc-200" : "bg-[#161617] border-zinc-800"
                      }`}>
                        <span className="text-[14px] font-mono font-bold text-violet-500">99.9%</span>
                        <span className="text-[8px] font-mono text-zinc-400">ACCURACY</span>
                      </div>
                      <div className={`col-span-8 p-3 rounded-xl border flex items-center gap-3 ${
                        localTheme === "light" ? "bg-white border-zinc-200" : "bg-[#161617] border-zinc-800"
                      }`}>
                        <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-mono">✓</div>
                        <span className="text-[10px] text-zinc-400">Audit checklist passed. Ready for staging deployment.</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedRef.id === "warm-organic" && (
                  <motion.div
                    key="organic"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 text-left"
                  >
                    <div className="space-y-2">
                      <h1 className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                        {selectedRef.miniMockup.heroTitle}
                      </h1>
                      <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                        {selectedRef.miniMockup.heroSubtitle}
                      </p>
                    </div>

                    {/* Warm clay style elements */}
                    <div className={`p-4 rounded-2xl border-2 flex gap-3 items-center ${
                      localTheme === "light" ? "bg-amber-50/35 border-amber-100" : "bg-emerald-950/10 border-emerald-900/30"
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center text-xs font-serif font-bold">A</div>
                      <div>
                        <h4 className="text-xs font-bold font-sans">Organic Valley Roast</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Naturally dried, sun-cured espresso robusta beans.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Specs parameters card footer inside Simulated Live canvas */}
              <div className={`relative z-10 border-t pt-4 mt-6 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 gap-3 ${
                localTheme === "light" ? "border-zinc-200" : "border-zinc-900"
              }`}>
                <div>
                  <span className="block text-[8px] font-mono text-zinc-400">Typography Setup</span>
                  <span className="font-medium text-[10px] text-zinc-700 dark:text-zinc-350">{selectedRef.typography}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-mono text-zinc-400">Best Suited Category</span>
                  <span className="font-medium text-[10px] text-zinc-700 dark:text-zinc-350">{selectedRef.vibe}</span>
                </div>
              </div>
            </div>

            {/* Selection CTA inside primary panel */}
            <div className="p-4 border-t border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-zinc-650 dark:text-zinc-400 text-left">
                <strong>Best For:</strong> {selectedRef.bestFor}
              </p>
              <button
                onClick={() => handleSelectStyle(selectedRef)}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                Select {selectedRef.name}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating global selector status banner on active triggers */}
      <AnimatePresence>
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 bg-zinc-950 text-white border border-zinc-800 p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3.5 max-w-sm text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20 shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Style Prefilled!</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                We prefilled the <strong>"{copiedNotification}"</strong> reference in your brief. Feel free to review or customize below!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
