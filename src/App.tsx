import { useState, useEffect } from "react";
import { MessageCircle, Shield, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Work from "./components/Work";
import Pricing from "./components/Pricing";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Legal from "./components/Legal";
import Helmet from "./components/Helmet";
import Chatbot from "./components/Chatbot";
import Testimonials from "./components/Testimonials";
import AdminWorkspace from "./components/AdminWorkspace";
import VisitorAnalytics from "./components/VisitorAnalytics";
import CommandPalette from "./components/CommandPalette";
import BlueprintOverlay from "./components/BlueprintOverlay";
import { PerspectiveProvider } from "./context/PerspectiveContext";

const METADATA_MAP: Record<string, { title: string; description: string; keywords: string }> = {
  home: {
    title: "Suman Web Design Agency | Premium Website Design & Development",
    description: "Elite digital solutions and premium custom-tailored web development services. We architect high-converting, blazing-fast, and bespoke websites.",
    keywords: "web design, bespoke website, premium agency, custom development, elite design, fast web"
  },
  services: {
    title: "Our Services | Suman Web Design Agency",
    description: "Explore our premium web solutions, custom full-stack development, mobile-first design, high-converting copy, and lightning-fast SEO architectural optimization.",
    keywords: "full-stack developer, UI/UX design, custom web solutions, SEO optimization, responsive design"
  },
  work: {
    title: "Case Studies & Portfolio | Suman Web Design Agency",
    description: "Browse our gallery of elite custom designs, cutting-edge corporate portals, SaaS platforms, and beautifully animated bespoke client projects.",
    keywords: "web design portfolio, react projects, case studies, corporate portals, UI showcases"
  },
  pricing: {
    title: "Premium Plans & Transparent Pricing | Suman Web Design Agency",
    description: "Choose the perfect bespoke development plan for your enterprise. No hidden fees, clear deliverables, and high-performance engineering tailored for you.",
    keywords: "web development cost, design agency rates, custom website pricing, contract developers"
  },
  contact: {
    title: "Start Your Project | Suman Web Design Agency",
    description: "Let's collaborate on your next luxury digital masterpiece. Get a custom proposal, free architectural audit, and connect with our design team today.",
    keywords: "hire web designer, request quote web design, developer contact, WhatsApp inquiry"
  },
  privacy: {
    title: "Privacy Policy | Suman Web Design Agency",
    description: "Read our terms of privacy protection. Learn how Suman Web Design Agency safeguards client and user data with top-tier compliance and transparency.",
    keywords: "privacy policy, data protection, user security"
  },
  cookie: {
    title: "Cookie Policy | Suman Web Design Agency",
    description: "Understand how our digital architecture uses modern, secure cookie technologies to enhance performance, maintain themes, and secure user sessions.",
    keywords: "cookies, local storage, site performance, browser cookies"
  },
  refund: {
    title: "Refund Policy | Suman Web Design Agency",
    description: "Review our straightforward refund terms and project milestone satisfaction guarantees for bespoke digital development and architectural services.",
    keywords: "refund policy, client protection, developer agreement"
  },
  admin: {
    title: "Admin Workspace | Suman Design Console",
    description: "Operations console dashboard panel for website CMS content management, customer CRM inquiries, and digital telemetry.",
    keywords: "admin, dashboard, cms, crm"
  }
};

export default function App() {
  // Sync visual theme with localStorage and document class
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light" || savedTheme === "dark") {
          return savedTheme;
        }
      } catch (e) {
        console.warn("localStorage access denied:", e);
      }
      // First time opening the site should default to light theme
      return "light";
    }
    return "light";
  });

  const getAdminToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(^|;)\s*admin_token\s*=\s*([^;]+)/);
    return match ? match[2] : null;
  };

  const [activePage, setActivePage] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.startsWith("/admin")) {
        const adminPage = path.substring(1);
        const token = getAdminToken();
        if (adminPage !== "admin/login" && !token) {
          // Redirect unauthenticated users to /admin/login preserving redirect
          const redirectUrl = `/admin/login?redirect=${encodeURIComponent(path)}`;
          window.history.replaceState(null, "", redirectUrl);
          return "admin/login";
        }
        return adminPage;
      }
      const hash = window.location.hash.replace("#", "");
      if (hash.startsWith("admin")) {
        return hash;
      }
      if (["home", "services", "work", "pricing", "contact", "privacy", "cookie", "refund"].includes(hash)) {
        return hash;
      }
    }
    return "home";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("theme-light-cursor");
      root.classList.add("theme-dark-cursor");
    } else {
      root.classList.remove("dark");
      root.classList.add("theme-light-cursor");
      root.classList.remove("theme-dark-cursor");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      console.warn("localStorage write denied:", e);
    }
  }, [theme]);

  // Read URL Hash and Pathname on mount and on browser navigation
  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.replace("#", "");
      
      if (path.startsWith("/admin")) {
        const adminPage = path.substring(1);
        const token = getAdminToken();
        if (adminPage !== "admin/login" && !token) {
          const redirectUrl = `/admin/login?redirect=${encodeURIComponent(path)}`;
          window.history.replaceState(null, "", redirectUrl);
          setActivePage("admin/login");
        } else {
          setActivePage(adminPage);
        }
        window.scrollTo({ top: 0, behavior: "instant" as any });
      } else if (hash.startsWith("admin")) {
        const token = getAdminToken();
        if (hash !== "admin/login" && hash !== "admin-login" && !token) {
          const redirectUrl = `/admin/login?redirect=${encodeURIComponent("/" + hash)}`;
          window.history.replaceState(null, "", redirectUrl);
          setActivePage("admin/login");
        } else {
          setActivePage(hash);
        }
        window.scrollTo({ top: 0, behavior: "instant" as any });
      } else if (["home", "services", "work", "pricing", "contact", "privacy", "cookie", "refund"].includes(hash)) {
        setActivePage(hash);
        window.scrollTo({ top: 0, behavior: "instant" as any });
      } else if (!hash) {
        setActivePage("home");
        window.scrollTo({ top: 0, behavior: "instant" as any });
      }
    };
    window.addEventListener("hashchange", handleNavigation);
    window.addEventListener("popstate", handleNavigation);
    handleNavigation();
    return () => {
      window.removeEventListener("hashchange", handleNavigation);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isBlueprintActive, setIsBlueprintActive] = useState(false);
  const [accentColor, setAccentColor] = useState("violet");

  useEffect(() => {
    const handleOpenCmd = () => setIsCommandPaletteOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("open-command-palette", handleOpenCmd);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("open-command-palette", handleOpenCmd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const handleToggleTheme = () => {
      setTheme(prev => (prev === "dark" ? "light" : "dark"));
    };
    window.addEventListener("toggle-theme", handleToggleTheme);
    return () => window.removeEventListener("toggle-theme", handleToggleTheme);
  }, []);

  const isAdminPage = activePage.startsWith("admin");
  const currentMetadata = METADATA_MAP[activePage] || METADATA_MAP[activePage.split("/")[0]] || METADATA_MAP.home;

  // If we are on any admin tab page, render the full admin workspace
  if (isAdminPage) {
    return (
      <div id="app-root-container" className="min-h-screen bg-[#030303] selection:bg-violet-500 selection:text-white">
        <Helmet 
          title={currentMetadata.title} 
          description={currentMetadata.description} 
          keywords={currentMetadata.keywords} 
          activePage={activePage}
        />
        <AdminWorkspace activePage={activePage} setActivePage={setActivePage} />
      </div>
    );
  }

  return (
    <PerspectiveProvider>
      <div
        id="app-root-container"
        className="min-h-screen text-[#1d1d1f] dark:text-[#f5f5f7] bg-[#f5f5f7] dark:bg-[#09090b] transition-colors duration-300 overflow-x-hidden selection:bg-violet-500 selection:text-white flex flex-col justify-between"
      >
        {/* Dynamic SEO Document Titles & Meta Descriptions */}
        <Helmet 
          title={currentMetadata.title} 
          description={currentMetadata.description} 
          keywords={currentMetadata.keywords} 
          activePage={activePage}
        />

        {/* Visitor analytics engine handles all database session logs & feedback */}
        <VisitorAnalytics />

        <div>
          {/* Decorative Grid overlay on top of body */}
          <div className="fixed inset-0 pointer-events-none noise-bg opacity-40 z-0" />

          {/* Main navigation Header */}
          <Navbar theme={theme} toggleTheme={toggleTheme} activePage={activePage} setActivePage={setActivePage} />

          {/* Main content body sections with separate page views and smooth transitions */}
          <main className="relative z-10 pt-16 sm:pt-20 min-h-[75vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                {activePage === "home" && (
                  <Hero setActivePage={setActivePage} />
                )}
                {activePage === "services" && <Services />}
                {activePage === "work" && <Work />}
                {activePage === "pricing" && <Pricing setActivePage={setActivePage} />}
                {activePage === "contact" && <Contact />}
                {(activePage === "privacy" || activePage === "cookie" || activePage === "refund") && (
                  <Legal policy={activePage} setActivePage={setActivePage} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Footer information */}
        <Footer setActivePage={setActivePage} />

        {/* Floating Gemini Chatbot */}
        <Chatbot />

        {/* Interactive Command Menu Palette (Cmd+K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          setActivePage={(page) => {
            setActivePage(page);
            window.location.hash = `#${page}`;
          }}
          toggleTheme={toggleTheme}
          theme={theme}
          toggleBlueprint={() => setIsBlueprintActive(!isBlueprintActive)}
          isBlueprintActive={isBlueprintActive}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
        />

        {/* Architecture Wireframe Blueprint Grid Overlay */}
        <BlueprintOverlay
          isActive={isBlueprintActive}
          onClose={() => setIsBlueprintActive(false)}
        />
      </div>
    </PerspectiveProvider>
  );
}
