import { motion } from "motion/react";
import { Layout, Code2, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

interface ServicesSnapshotProps {
  setActivePage: (page: "home" | "services" | "work" | "pricing" | "contact") => void;
}

export default function ServicesSnapshot({ setActivePage }: ServicesSnapshotProps) {
  const services = [
    {
      icon: Layout,
      title: "UI/UX & Website Design",
      badge: "Visual Systems",
      description: "Bespoke digital design tailored to your luxury brand identity and user journey.",
      bullets: [
        "Tailored Figma Design Systems & UI Kits",
        "Conversion-Engineered User Flows & Wireframes",
        "Accessibility-First Color & Typography Scales"
      ]
    },
    {
      icon: Code2,
      title: "Hand-Coded Development",
      badge: "Zero Bloat Engine",
      description: "Built with modern Next.js 14, React 18, and TypeScript for uncompromised velocity.",
      bullets: [
        "Server-Side Rendering & Edge-Cached Static Pages",
        "Clean, Maintainable & Scalable TypeScript",
        "Headless CMS Integration & Custom API Proxies"
      ]
    },
    {
      icon: Zap,
      title: "Performance & SEO Audit",
      badge: "100/100 Core Vitals",
      description: "Eliminate latency defects and rank higher on Google search results automatically.",
      bullets: [
        "Core Web Vitals Benchmark Optimization (LCP < 1.0s)",
        "Zero Cumulative Layout Shift (CLS: 0.00)",
        "Semantic Schema Markup & Automated Sitemap Indexing"
      ]
    }
  ];

  const handleNavigateServices = () => {
    setActivePage("services");
    window.location.hash = "#services";
    window.scrollTo({ top: 0, behavior: "instant" as any });
  };

  return (
    <section className="py-16 lg:py-24 bg-zinc-50/60 dark:bg-[#0c0c0e] border-b border-zinc-200/60 dark:border-zinc-850/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 mb-3">
            [ SERVICES SNAPSHOT ]
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
            High-Ticket Digital Capabilities
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
            Full-spectrum architectural capabilities engineered to deliver measurable business results.
          </p>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111114] border border-zinc-200/80 dark:border-zinc-850/80 shadow-sm hover:shadow-xl hover:border-violet-500/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-semibold text-zinc-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                    {service.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-snug">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Section Footer CTA */}
        <div className="text-center">
          <button
            onClick={handleNavigateServices}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl transition-all duration-300 shadow-sm cursor-pointer"
          >
            View Full Service Scope & Pricing
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
}
