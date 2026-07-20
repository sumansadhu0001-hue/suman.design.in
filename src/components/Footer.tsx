import { Mail, Phone, Instagram, ArrowUp, Send, Check, Lock } from "lucide-react";
import { motion } from "motion/react";

interface FooterProps {
  setActivePage: (page: "home" | "services" | "work" | "pricing" | "contact" | "privacy" | "cookie" | "refund") => void;
}

export default function Footer({ setActivePage }: FooterProps) {
  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handlePageNavigate = (page: "home" | "services" | "work" | "pricing" | "contact") => {
    setActivePage(page);
    window.location.hash = `#${page}`;
    window.scrollTo({ top: 0, behavior: "instant" as any });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="agency-footer"
      className="bg-zinc-100 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300 relative text-left"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-3.5 flex flex-col items-center md:items-start text-center md:text-left">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handlePageNavigate("home");
              }}
              className="text-2xl font-display font-bold tracking-tight text-zinc-900 dark:text-white"
            >
              Suman<span className="text-violet-500 font-medium">.design</span>
            </a>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
              High-performance, visual-first digital architecture engineered with technical precision. Handcrafted in India.
            </p>
            
            {/* Status indicator */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 text-xs font-semibold border border-emerald-500/10">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for New Projects</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", page: "home" },
                { label: "Services", page: "services" },
                { label: "Work", page: "work" },
                { label: "Pricing", page: "pricing" },
                { label: "Contact", page: "contact" }
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={`#${link.page}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageNavigate(link.page as any);
                    }}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Col */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Services
            </h4>
            <ul className="space-y-2.5">
              {[
                "Website Design",
                "Web Development",
                "Performance Optimization",
                "E-Commerce Solutions",
                "Continuous Support",
                "Custom integrations"
              ].map((srv) => (
                <li key={srv}>
                  <a
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageNavigate("services");
                    }}
                    className="text-sm text-zinc-650 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    {srv}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Legal disclaimer */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Connect
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Let's create something outstanding. Get in touch via email or our live social channels.
            </p>
            <div className="flex gap-3 pt-1 justify-start">
              {[
                { icon: Mail, label: "Email", href: "mailto:sumansadhu0001@gmail.com" },
                { icon: Phone, label: "WhatsApp", href: "https://wa.me/919883581298" },
                { icon: Instagram, label: "Instagram", href: "https://instagram.com/suman_web_design" }
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-900 border border-zinc-350/10 hover:border-violet-500/50 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-all"
                >
                  <item.icon className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>

            {/* Back to top button */}
            <div className="flex justify-end">
              <button
                onClick={handleBackToTop}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 hover:text-violet-700 cursor-pointer pt-3"
              >
                Back to Top
                <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
              </button>
            </div>
          </div>

        </div>

        {/* Footer Bottom meta and legal disclaimers */}
        <div className="pt-8 border-t border-zinc-200/60 dark:border-zinc-900/80 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start">
            <p className="text-xs text-zinc-400 dark:text-zinc-550">
              &copy; {currentYear} Suman Design. All Rights Reserved. Handcrafted in West Bengal, India.
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-550 max-w-2xl mt-2 leading-relaxed">
              Disclaimer: All custom project previews showcased on this applet labeled as "Concept Studies" represent layout models built to showcase engineering performance parameters. They are not client partnerships unless stated explicitly.
            </p>
          </div>

          {/* Legal Sitemap anchors */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center sm:justify-start">
            {[
              { label: "Privacy Policy", page: "privacy" as const },
              { label: "Cookie Policy", page: "cookie" as const },
              { label: "Refund Policy", page: "refund" as const }
            ].map((item) => (
              <a
                key={item.page}
                href={`#${item.page}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage(item.page);
                  window.location.hash = `#${item.page}`;
                  window.scrollTo({ top: 0, behavior: "instant" as any });
                }}
                className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            ))}
            
            {/* Subtle Admin Sign-In */}
            <a
              href="/admin/login"
              className="text-xs text-zinc-400/25 dark:text-zinc-500/25 hover:text-zinc-700 dark:hover:text-zinc-350 transition-colors cursor-pointer flex items-center gap-1.5 ml-2 select-none"
              title="Admin Portal"
            >
              <Lock className="w-3.5 h-3.5 opacity-40 hover:opacity-100 transition-opacity" />
              <span>Admin</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
