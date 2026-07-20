import { motion } from "motion/react";
import { Shield, Eye, Lock, FileText, Scale, ArrowLeft, Cookie, RefreshCw, AlertCircle, Calendar } from "lucide-react";

interface LegalProps {
  policy: "privacy" | "cookie" | "refund";
  setActivePage: (page: any) => void;
}

export default function Legal({ policy, setActivePage }: LegalProps) {
  const currentYear = new Date().getFullYear();

  const handleBackToHome = () => {
    setActivePage("home");
    window.location.hash = "#home";
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const policies = {
    privacy: {
      title: "Privacy Policy",
      subtitle: "Last Updated: July 2026",
      icon: Shield,
      tagline: "We value your trust. This Privacy Policy details how Suman Design handles your digital footprint and data.",
      content: (
        <div className="space-y-8 text-left">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-violet-500/10 text-violet-500 text-xs font-mono">1</span>
              Information We Collect
            </h3>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              We collect information that you voluntarily provide to us when you express an interest in obtaining information about us or our services, or when you contact us directly.
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-650 dark:text-zinc-400 space-y-2">
              <li><strong>Contact Information:</strong> Full name, email address (<code className="font-mono text-violet-600 dark:text-violet-400">sumansadhu0001@gmail.com</code>), phone number, and WhatsApp details.</li>
              <li><strong>Project Specifications:</strong> Business details, functional designs, aesthetic targets, and technical parameters you share for custom development.</li>
              <li><strong>Automatic Metadata:</strong> IP address, device type, browser settings, operating system, and navigation patterns on our site.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-violet-500/10 text-violet-500 text-xs font-mono">2</span>
              How We Use Your Data
            </h3>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              We prioritize data-minimization practices. Your information is processed exclusively for valid operational reasons:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-650 dark:text-zinc-400 space-y-2">
              <li>To evaluate project scopes, prepare custom estimates, and draft development plans.</li>
              <li>To construct and compile custom client preview builds on our staging environment.</li>
              <li>To maintain continuous communication via email, calls, or real-time WhatsApp channels.</li>
              <li>To optimize our website's load speed, navigation structures, and responsive accessibility.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-violet-500/10 text-violet-500 text-xs font-mono">3</span>
              Security and Data Protection
            </h3>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              Suman Design integrates top-tier administrative and physical safety measures to shield your data from unauthorized access or alteration. We utilize SSL encryption for all data transmissions, secure cloud staging configurations, and strictly partition administrative database access.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-violet-500/10 text-violet-500 text-xs font-mono">4</span>
              Third-Party Services
            </h3>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              We do not sell, rent, or trade your personal information. We may utilize third-party analytics (such as privacy-respecting basic analytics tools) or content delivery networks to host components securely. All integrations comply strictly with safety and privacy mandates.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-violet-500/10 text-violet-500 text-xs font-mono">5</span>
              Contact and Corrections
            </h3>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              You possess absolute control over your digital footprint. To audit, adjust, or delete your contact parameters, you may correspond with us directly at <a href="mailto:sumansadhu0001@gmail.com" className="text-violet-600 dark:text-violet-400 underline font-semibold">sumansadhu0001@gmail.com</a>.
            </p>
          </section>
        </div>
      )
    },
    cookie: {
      title: "Cookie Policy",
      subtitle: "Last Updated: July 2026",
      icon: Cookie,
      tagline: "Transparent and secure. Learn how we deploy cookies to optimize our user experience without tracking you across the web.",
      content: (
        <div className="space-y-8 text-left">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-violet-500/10 text-violet-500 text-xs font-mono">1</span>
              What are Cookies?
            </h3>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              Cookies are small data files placed on your browser or device when you browse websites. They are essential to deliver dynamic functionality, maintain active user preferences (such as dark/light themes), and verify interface speed.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-violet-500/10 text-violet-500 text-xs font-mono">2</span>
              How We Use Cookies
            </h3>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              Suman Design does not use tracking mechanisms for advertising or cross-site profiling. We use cookies exclusively for:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-650 dark:text-zinc-400 space-y-2">
              <li><strong>Visual Preferences:</strong> Retaining your choice between Light Mode and Dark Mode (<code className="font-mono text-xs text-violet-500">localStorage</code> state).</li>
              <li><strong>UI State:</strong> Caching navigation and active page states for instant layout presentation.</li>
              <li><strong>Performance:</strong> Ensuring swift asset delivery and preventing redundant animation reloads.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-violet-500/10 text-violet-500 text-xs font-mono">3</span>
              Managing Your Settings
            </h3>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              You can adjust or refuse cookies through your browser settings. Be advised that disabling fundamental functional cookies may alter visual transitions, disable persistent dark mode caching, or degrade specific layout performance.
            </p>
          </section>
        </div>
      )
    },
    refund: {
      title: "Refund Policy",
      subtitle: "Last Updated: July 2026",
      icon: RefreshCw,
      tagline: "Honesty and professional clarity. Read our transparent terms regarding design and development service fees.",
      content: (
        <div className="space-y-8 text-left">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-violet-500/10 text-violet-500 text-xs font-mono">1</span>
              Service Retainers and Milestones
            </h3>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              All custom projects are structured around sequential milestone stages (e.g., Wireframe & Design Discovery, Frontend Engineering, Backend Compilation, Optimization, and Deployment). Each milestone is initiated upon mutual written approval and clear payment of its associated retainer fee.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-violet-500/10 text-violet-500 text-xs font-mono">2</span>
              Refund Eligibility
            </h3>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              Because custom software engineering and digital interface design require intense time commitments, custom assets, and technical infrastructure provisioning:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-650 dark:text-zinc-400 space-y-2">
              <li><strong>Initiated Milestones:</strong> Payments made for milestones that are actively underway or completed are strictly **non-refundable**.</li>
              <li><strong>Future Milestones:</strong> Any prepayments for milestones that have not yet been initiated can be fully refunded upon written contract dissolution.</li>
              <li><strong>Concept Reviews:</strong> For visual discovery sprints, if the initial visual direction does not meet expectations, the client may cancel the project prior to the frontend compilation phase. Any unused retainers will be calculated proportionally based on working hours.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-violet-500/10 text-violet-500 text-xs font-mono">3</span>
              Project Cancellation Process
            </h3>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              Either party may request contract cancellation by sending an official notice to <a href="mailto:sumansadhu0001@gmail.com" className="text-violet-600 dark:text-violet-400 underline font-semibold">sumansadhu0001@gmail.com</a>. Upon cancellation, all visual mockups, engineering builds, and source code compiled up to the cancellation date remain the intellectual property of Suman Design until outstanding milestone tallies are completed.
            </p>
          </section>
        </div>
      )
    }
  };

  const currentPolicy = policies[policy];
  const IconComponent = currentPolicy.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 text-left">
      {/* Return Navigation */}
      <button
        onClick={handleBackToHome}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-650 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 bg-white dark:bg-[#161617] hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl transition-all cursor-pointer mb-10 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </button>

      {/* Main Document Layout Card */}
      <div className="bg-white dark:bg-[#161617]/95 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/5 to-transparent pointer-events-none rounded-tr-2xl" />
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-150/60 dark:border-zinc-800/80 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/10">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 dark:text-white">
                {currentPolicy.title}
              </h1>
              <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {currentPolicy.subtitle}
              </p>
            </div>
          </div>
          <div className="inline-flex px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500 dark:text-zinc-400 self-start sm:self-center">
            LEGAL // {policy.toUpperCase()}
          </div>
        </div>

        {/* Dynamic introduction block */}
        <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 text-sm text-zinc-700 dark:text-zinc-300 italic mb-8">
          {currentPolicy.tagline}
        </div>

        {/* Policy Contents */}
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          {currentPolicy.content}
        </div>

        {/* Verification footer seal */}
        <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 gap-4">
          <p>Verified Suman Design Corporate Policy document.</p>
          <p className="font-mono text-[10px]">&copy; {currentYear} Suman Design. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
