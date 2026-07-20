import { Menu, X, ArrowUpRight } from "lucide-react";
import { useState, useEffect, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  activePage: "home" | "services" | "work" | "pricing" | "contact";
  setActivePage: (page: "home" | "services" | "work" | "pricing" | "contact") => void;
}

const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({ theme, toggleTheme, activePage, setActivePage }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const targetId = href.substring(1) as "home" | "services" | "work" | "pricing" | "contact";
    setActivePage(targetId);
    window.location.hash = href;
    window.scrollTo({
      top: 0,
      behavior: "instant" as any
    });
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 h-screen w-screen bg-zinc-950/50 dark:bg-black/75 backdrop-blur-xs z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <header
        id="navbar-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isOpen || scrolled
            ? "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-md border-zinc-200 dark:border-violet-900/40 py-3"
            : "bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-zinc-100 dark:border-violet-900/10 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, "#home")}
              className="text-xl md:text-2xl font-display font-bold tracking-tight text-zinc-900 dark:text-white"
            >
              Suman<span className="text-violet-500 font-medium">.design</span>
            </a>

            {/* Desktop / Tablet Navigation */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`text-xs lg:text-sm font-medium tracking-wide transition-colors relative py-1 ${
                    activePage === item.href.substring(1)
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                  {activePage === item.href.substring(1) && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="hidden md:flex items-center space-x-2.5 lg:space-x-4">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              {/* Desktop CTA */}
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "#contact")}
                className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 rounded-full shadow-sm transition-colors cursor-pointer group"
              >
                Get In Touch
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              {/* Tablet CTA */}
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "#contact")}
                className="inline-flex lg:hidden items-center px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 rounded-full shadow-sm transition-colors cursor-pointer"
              >
                Contact
              </a>
            </div>

            {/* Mobile Actions Container */}
            <div className="flex md:hidden items-center space-x-3">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              <button
                id="mobile-menu-toggle"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-200/80 dark:border-violet-900/50 shadow-2xl overflow-hidden rounded-b-3xl"
            >
              <div className="px-5 pt-4 pb-7 space-y-3 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md rounded-b-3xl border-t border-zinc-200/20 dark:border-zinc-800/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-200 border ${
                      activePage === item.href.substring(1)
                        ? "bg-violet-500/10 dark:bg-violet-500/15 border-violet-500/20 text-violet-600 dark:text-violet-400 font-semibold shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 border-transparent hover:border-zinc-200/35 dark:hover:border-zinc-800/40 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-2 px-3">
                  <a
                    href="#contact"
                    onClick={(e) => handleNavClick(e, "#contact")}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 font-medium text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 rounded-xl transition-colors text-center shadow-md cursor-pointer"
                  >
                    Get In Touch
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
