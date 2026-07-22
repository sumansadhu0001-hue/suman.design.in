import { useState } from "react";
import { Check, HelpCircle, Plus, Minus, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PRICING_PLANS, FAQS } from "../data";
import { usePerspective } from "../context/PerspectiveContext";

interface PricingProps {
  setActivePage: (page: "home" | "services" | "work" | "pricing" | "contact") => void;
}

const devPricingMap: Record<number, {
  archTag: string;
  description: string;
  features: string[];
  slaBadge: string;
}> = {
  0: {
    archTag: "SINGLE-PAGE SSR LANDING ARCHITECTURE",
    description: "Pure static export with zero database overhead and direct Vercel Edge CDN deployment.",
    features: [
      "Pure static export / Zero DB dependencies",
      "Direct Vercel Edge / Cloudflare Workers deployment",
      "Tailwind CSS JIT compilation with PurgeCSS",
      "100/100 Lighthouse performance baseline guarantee",
      "30 Days Post-Launch Critical Bug Fixing SLA"
    ],
    slaBadge: "30-DAY BUG FIX SLA"
  },
  1: {
    archTag: "FULL-STACK NEXT.JS ARCHITECTURE",
    description: "Production-ready full-stack web application with edge API routes, ORM schemas, and webhooks.",
    features: [
      "Dynamic Edge API routes & Node.js backend proxy",
      "Headless CMS Integration (Sanity / Strapi / Hygraph)",
      "Supabase or PostgreSQL schema with type-safe ORM",
      "Custom Webhook handlers for payment gateways (Stripe / Razorpay)",
      "90 Days Priority Bug Fixing & Edge Maintenance SLA"
    ],
    slaBadge: "90-DAY VIP SLA"
  },
  2: {
    archTag: "ENTERPRISE / BESPOKE DISTRIBUTED SYSTEM",
    description: "High-scale micro-frontend ecosystem, Redis cache layers, and dedicated SLA engineering.",
    features: [
      "Micro-frontend architecture & module federation",
      "Redis caching layer & distributed rate-limiting",
      "Automated GitHub Actions CI/CD deployment pipeline setup",
      "Custom design token export (Figma to Tailwind sync)",
      "1-Year VIP Engineering & Incident SLA"
    ],
    slaBadge: "1-YEAR VIP SLA"
  }
};

export default function Pricing({ setActivePage }: PricingProps) {
  const { perspective } = usePerspective();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaq(prev => (prev === id ? null : id));
  };

  const handleScrollToContact = (packageType: string) => {
    // Scroll to contact form and populate package preference in local storage or input fields
    localStorage.setItem("selected_package", packageType);
    
    // Dispatch custom event to let Contact component know to update its form fields
    window.dispatchEvent(new CustomEvent("package_selected", { detail: packageType }));

    setActivePage("contact");
    window.location.hash = "#contact";
    window.scrollTo({
      top: 0,
      behavior: "instant" as any
    });
  };

  return (
    <section
      id="pricing"
      className="pt-6 sm:pt-12 pb-12 sm:pb-20 bg-[#f5f5f7] dark:bg-[#09090b] transition-colors duration-300 relative overflow-hidden"
    >
      {/* Background blobs for premium vibe */}
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-violet-400/5 dark:bg-violet-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-cyan-400/5 dark:bg-cyan-600/5 blur-[100px] pointer-events-none" />

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
              Bespoke Investment
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mt-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Transparent and Flexible Pricing
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-zinc-650 dark:text-zinc-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Select the tier matching your scale parameters. All packages represent hand-coded, high-performance web products backed by direct engineer support.
          </motion.p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 md:items-center items-stretch">
          {PRICING_PLANS.map((plan, index) => {
            const devData = devPricingMap[index];
            const activeDescription = perspective === "developer" && devData ? devData.description : plan.description;
            const activeFeatures = perspective === "developer" && devData ? devData.features : plan.features;

            return (
              <motion.div
                key={plan.id}
                className={`rounded-2xl border flex flex-col justify-between relative transition-colors duration-300 group ${
                  plan.popular
                    ? "bg-gradient-to-b from-white via-white to-zinc-50/10 dark:from-[#1b1535]/40 dark:via-[#161617] dark:to-[#161617] border-t-2 border-t-violet-400 border-x border-b border-violet-500/80 dark:border-t-violet-400/80 dark:border-x-violet-500/60 dark:border-b-violet-600/80 md:py-14 md:px-8 py-11 px-8 shadow-[0_25px_60px_-15px_rgba(124,58,237,0.25),0_0_30px_rgba(124,58,237,0.05),inset_0_1px_0_rgba(255,255,255,0.15)] dark:shadow-[0_35px_70px_-15px_rgba(124,58,237,0.3),0_0_40px_rgba(124,58,237,0.08)] ring-1 ring-violet-500/30 md:-translate-y-2 z-10"
                    : "bg-white dark:bg-[#161617]/95 border-zinc-250 dark:border-zinc-800/80 p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)]"
                }`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                whileHover={{ 
                  y: plan.popular ? -18 : -8,
                  scale: plan.popular ? 1.03 : 1.015,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                  delay: index * 0.06
                }}
              >
                {/* Soft ambient hover spotlight wrapper */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  {plan.popular ? (
                    <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-violet-500/15 blur-3xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                  ) : (
                    <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-zinc-200/40 dark:bg-zinc-800/20 blur-3xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                  )}
                </div>

                {/* Popular Tag or SLA Badge */}
                {perspective === "developer" && devData ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider text-violet-300 bg-violet-950/90 border border-violet-500/50 z-20 shadow-md">
                    <Terminal className="w-3 h-3 text-violet-400" />
                    {devData.slaBadge}
                  </span>
                ) : (
                  plan.popular && plan.badge && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-violet-600 shadow-[0_10px_25px_-5px_rgba(124,58,237,0.5),0_4px_10px_rgba(124,58,237,0.3)] border border-violet-500 z-20 transform -translate-y-1 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                      {plan.badge}
                    </span>
                  )
                )}

                <div className="relative z-10">
                  {/* Developer Architecture Badge */}
                  {perspective === "developer" && devData && (
                    <div className="mb-3 text-left">
                      <span className="inline-block text-[9px] font-mono font-bold text-violet-400 bg-violet-950/60 border border-violet-500/30 px-2.5 py-1 rounded-md">
                        {devData.archTag}
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-left mb-6">
                    <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className={`text-xs mt-1.5 leading-relaxed ${
                      perspective === "developer" ? "text-zinc-300 font-mono" : "text-zinc-500 dark:text-zinc-450"
                    }`}>
                      {activeDescription}
                    </p>
                  </div>

                  {/* Plan Price */}
                  <div className="text-left mb-8 pb-6 border-b border-zinc-150/60 dark:border-zinc-900">
                    <span className="text-4xl font-display font-black tracking-tight text-zinc-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-450 font-medium ml-1.5">
                      / {plan.period}
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3.5 text-left mb-8">
                    {activeFeatures.map((feat, idx) => (
                      <li key={idx} className={`flex items-start gap-3 text-xs leading-normal ${
                        perspective === "developer" ? "font-mono text-zinc-300" : "text-zinc-650 dark:text-zinc-300"
                      }`}>
                        <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300 ${
                          perspective === "developer"
                            ? "bg-violet-950/60 text-violet-400 border border-violet-500/40"
                            : plan.popular 
                              ? "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/60" 
                              : "bg-zinc-100 dark:bg-zinc-900/40 text-zinc-650 dark:text-zinc-400 group-hover:bg-zinc-200/60 dark:group-hover:bg-zinc-800"
                        }`}>
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                        <span className="group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-300">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              {/* Action Button */}
              <button
                onClick={() => handleScrollToContact(plan.packageType)}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-all duration-300 relative z-10 cursor-pointer ${
                  plan.popular
                    ? "bg-violet-600 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-500/20 text-white dark:bg-violet-600 dark:hover:bg-violet-500"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 border border-zinc-250/20 dark:border-zinc-800/60"
                }`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          );
        })}
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-4xl mx-auto pt-16 border-t border-zinc-150/60 dark:border-zinc-900">
          <div className="text-center mb-12 flex flex-col items-center">
            <HelpCircle className="w-8 h-8 text-violet-500 dark:text-violet-400 mb-3" />
            <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">
              Pricing & Process FAQs
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-450 mt-1 max-w-lg">
              Everything you need to know about budgets, timelines, revisions, and post-launch maintenance.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-zinc-300 dark:border-zinc-900/60 bg-white dark:bg-[#161617]/40 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-800"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between text-left p-5 sm:p-6 text-zinc-900 dark:text-white font-semibold text-sm sm:text-base hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 shrink-0 ml-4">
                      {isOpen ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-6 sm:px-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200 dark:border-zinc-900 pt-4 text-left">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Verification seal */}
          <div className="mt-12 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-400 self-center">
            <ShieldCheck className="w-4.5 h-4.5" />
            <span>Guaranteed deliverables governed strictly by legal partner SLA metrics.</span>
          </div>

        </div>

      </div>
    </section>
  );
}
