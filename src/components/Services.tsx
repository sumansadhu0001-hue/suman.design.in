import { Palette, Code, Zap, ShoppingBag, ShieldCheck, Cpu, Check } from "lucide-react";
import { ComponentType, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SERVICES } from "../data";
import { SkeletonGrid } from "./SkeletonLoader";
import { usePerspective } from "../context/PerspectiveContext";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Palette,
  Code,
  Zap,
  ShoppingBag,
  ShieldCheck,
  Cpu
};

export default function Services() {
  const { perspective } = usePerspective();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Developer mode specific engineering specification data for each service index
  const devServicesMap: Record<number, {
    title: string;
    category: string;
    description: string;
    details: string[];
    tags: string[];
  }> = {
    0: {
      title: "UI/UX Design Systems & Tokenology",
      category: "DESIGN_SPEC // TOKENS",
      description: "Systematized design token architecture bridging Figma variables and Tailwind CSS compilation.",
      details: [
        "Atomic Design Tokens in Figma & Tailwind",
        "Custom SVG Icon System & Sprite Generation",
        "Accessible Color Contrast Matrix (4.5:1 ratio)"
      ],
      tags: ["Design System Tokens", "WCAG 2.1 AA Compliant", "Fluid Typography Scale"]
    },
    1: {
      title: "Frontend Engineering & Edge Architecture",
      category: "ENGINEERING // RSC",
      description: "Zero-bloat React 18 frontend architecture compiled with TypeScript and edge runtime handlers.",
      details: [
        "React Server Components & Streaming SSR",
        "Strict TS Interfaces & Schema Validations (Zod)",
        "Web Vitals Optimization (Zero Layout Shifts)"
      ],
      tags: ["React 18 + TypeScript", "Zero Layout Shift (CLS: 0)", "Component Reusability"]
    },
    2: {
      title: "Core Web Vitals & Asset Pipeline Tuning",
      category: "PERFORMANCE // VITALS",
      description: "Deep LCP, TTFB, and CLS optimization pipeline targeting 100/100 Lighthouse performance audits.",
      details: [
        "Sub-second LCP & FID/INP tuning",
        "Script deferral, resource preloading & DNS preconnect",
        "AVIF/WebP image compression & font subsetting"
      ],
      tags: ["100/100 Lighthouse", "Sub-200ms TTFB", "Asset Gzip Compression"]
    },
    3: {
      title: "Headless E-Commerce & Checkout Engine",
      category: "COMMERCE // GRAPHQL",
      description: "Ultra-fast GraphQL storefront queries and frictionless payment gateway integrations.",
      details: [
        "Headless Storefront API & Redis Caching",
        "Asynchronous Stripe & Razorpay Webhook Handlers",
        "Sub-100ms Cart & Checkout Hydration"
      ],
      tags: ["Stripe Integration", "Optimized Product Queries", "Clean Semantic Markup"]
    },
    4: {
      title: "DevOps & Continuous Security Sweeps",
      category: "DEVOPS // CI/CD",
      description: "Automated GitHub Actions CI/CD pipelines, security scans, and SSL edge renewals.",
      details: [
        "Automated GitHub Actions Deployment Pipelines",
        "Strict CSP Headers & Vulnerability Audits",
        "Edge CDN Cache Invalidation & Rollback Support"
      ],
      tags: ["Strict Content Security", "Automated CI/CD", "Edge CDN Caching"]
    },
    5: {
      title: "Full-Stack API Routes & Database Schema",
      category: "FULLSTACK // DATABASE",
      description: "Relational Supabase / PostgreSQL schema definition with type-safe ORM integration.",
      details: [
        "Server-side Next.js / Express API Proxy Routes",
        "Type-safe Supabase & PostgreSQL Database Schemas",
        "Server-Sent Events & Real-time WebSockets"
      ],
      tags: ["Tailwind JIT Compilation", "Lazy Loading Modules", "Custom React Hooks"]
    }
  };

  return (
    <section
      id="services"
      className="pt-6 sm:pt-12 pb-12 sm:pb-20 bg-[#f5f5f7] dark:bg-[#09090b] transition-colors duration-300 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-3.5 py-1.5 rounded-full border border-violet-100 dark:border-violet-900/50">
              {perspective === "executive" ? "Executive Value Proposition" : "Technical Specification Specs"}
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mt-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {perspective === "executive" 
              ? "Bespoke Solutions Built to Drive Higher Conversions"
              : "Zero-Overhead Custom Frontend Architecture"}
          </motion.h2>

          <div className="min-h-[48px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={perspective}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="text-base sm:text-lg text-zinc-650 dark:text-zinc-400"
              >
                {perspective === "executive"
                  ? "We balance aesthetic restraint with conversion strategy. Every feature is engineered to build immediate client trust, boost SEO authority, and elevate revenue."
                  : "We adhere strictly to clean component abstraction, deterministic state flows, and modular CSS architecture with zero bloated dependencies or layout shifts."
                }
              </motion.p>
            </AnimatePresence>
          </div>
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
                const devData = devServicesMap[index];

                const title = perspective === "developer" && devData ? devData.title : srv.title;
                const category = perspective === "developer" && devData ? devData.category : srv.category;
                const description = perspective === "developer" && devData ? devData.description : srv.description;
                const details = perspective === "developer" && devData ? devData.details : srv.details;
                const activeTags = perspective === "developer" && devData ? devData.tags : srv.benefits;

                return (
                  <motion.div
                    key={srv.id}
                    className="bg-white dark:bg-[#161617]/95 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:border-violet-600 dark:hover:border-violet-500 hover:shadow-[0_12px_40px_-12px_rgba(124,58,237,0.12)] transition-all duration-300 group relative overflow-hidden"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: "easeOut",
                      delay: index * 0.06
                    }}
                  >
                    {/* Code Grid Line Marker in Developer Mode */}
                    {perspective === "developer" && (
                      <div className="absolute top-3 right-4 font-mono text-[9px] text-violet-500/60 font-bold pointer-events-none select-none">
                        // SPEC_0{index + 1}
                      </div>
                    )}

                    {/* Header & Icon */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                          perspective === "developer"
                            ? "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white"
                            : "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white"
                        }`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                          perspective === "developer"
                            ? "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/50 dark:border-violet-800/50 font-mono"
                            : "text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900"
                        }`}>
                          {category}
                        </span>
                      </div>

                      <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-3">
                        {title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                        {description}
                      </p>

                      {/* Detail Bullet List */}
                      <div className="border-t border-zinc-100 dark:border-zinc-900/80 pt-5 mt-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3.5">
                          {perspective === "executive" ? "Key Business Deliverables" : "Technical Specs & Modules"}
                        </h4>
                        <ul className="space-y-2.5">
                          {details.map((detail, idx) => (
                            <li key={idx} className={`flex items-start gap-2.5 text-xs leading-tight ${
                              perspective === "developer" ? "font-mono text-zinc-300" : "text-zinc-600 dark:text-zinc-400"
                            }`}>
                              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${
                                perspective === "developer" ? "text-violet-400" : "text-violet-500 dark:text-violet-400"
                              }`} />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Benefits / Outcomes */}
                    <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                        {perspective === "executive" ? "Business Impact" : "Architecture Benchmark"}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={perspective}
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -2 }}
                            transition={{ duration: 0.15 }}
                            className="flex flex-wrap gap-1.5"
                          >
                            {activeTags.map((tag, bIdx) => (
                              <span
                                key={bIdx}
                                className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                                  perspective === "developer" 
                                    ? "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 border border-violet-200/50 dark:border-violet-800/40"
                                    : "text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900"
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </motion.div>
                        </AnimatePresence>
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
