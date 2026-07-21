import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { Mail, Phone, Instagram, Send, ChevronDown, MessageSquare, Briefcase, DollarSign, Calendar, Eye, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SuccessModal from "./SuccessModal";
import FeedbackPopup from "./FeedbackPopup";

const PROJECT_TYPES = [
  "Landing Page",
  "Business Website",
  "Portfolio Website",
  "E-Commerce Website",
  "SaaS Platform",
  "Web Application",
  "UI/UX Design",
  "Custom Project"
];

const BUDGET_RANGES = [
  "Under ₹10k",
  "₹10k – ₹25k",
  "₹25k – ₹50k",
  "₹50k – ₹1L",
  "Above ₹1L"
];

const TIMELINES = [
  "ASAP",
  "1 Week",
  "2 Weeks",
  "1 Month",
  "Flexible"
];

const REFERRAL_SOURCES = [
  "Google Search",
  "LinkedIn",
  "Instagram",
  "WhatsApp Referral",
  "Friend/Colleague",
  "Other"
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    business_name: "",
    company_size: "1-10",
    projectType: "",
    budget: "",
    timeline: "",
    country: "India",
    referral: "",
    message: ""
  });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Rate limiting states (up to 3 submissions every 5 minutes)
  const [submissionTimes, setSubmissionTimes] = useState<number[]>([]);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const getValidSubmissions = (): number[] => {
    try {
      const stored = localStorage.getItem("contact_submissions_v1");
      if (!stored) return [];
      const times: number[] = JSON.parse(stored);
      if (!Array.isArray(times)) return [];
      const now = Date.now();
      return times.filter(t => now - t < 5 * 60 * 1000);
    } catch (e) {
      return [];
    }
  };

  useEffect(() => {
    const checkLimit = () => {
      const validTimes = getValidSubmissions();
      setSubmissionTimes(validTimes);
      
      if (validTimes.length >= 3) {
        setIsRateLimited(true);
        const oldest = Math.min(...validTimes);
        const timeElapsed = Date.now() - oldest;
        const timeToWait = Math.max(0, 5 * 60 * 1000 - timeElapsed);
        setTimeRemaining(Math.ceil(timeToWait / 1000));
      } else {
        setIsRateLimited(false);
        setTimeRemaining(0);
      }
    };

    checkLimit();
    const interval = setInterval(checkLimit, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto pre-populate options when selection events occur
  useEffect(() => {
    const handlePackageSelection = (e: Event) => {
      const packageType = (e as CustomEvent).detail;
      let budgetVal = "";
      let typeVal = "";

      if (packageType === "Starter") {
        budgetVal = "₹10k – ₹25k";
        typeVal = "Landing Page";
      } else if (packageType === "Business") {
        budgetVal = "₹25k – ₹50k";
        typeVal = "Business Website";
      } else if (packageType === "Custom") {
        budgetVal = "Above ₹1L";
        typeVal = "Custom Project";
      }

      setFormData(prev => ({
        ...prev,
        projectType: typeVal,
        budget: budgetVal,
        timeline: "ASAP"
      }));
    };

    const handleStyleSelection = (e: Event) => {
      const styleName = (e as CustomEvent).detail;
      setFormData(prev => ({
        ...prev,
        message: `Hi Suman, we would love to build our project using the "${styleName}" style reference. Let's design something premium and fast!`
      }));
    };

    window.addEventListener("package_selected", handlePackageSelection);
    window.addEventListener("style_selected", handleStyleSelection);

    // Also check local storage on load
    try {
      const savedPackage = localStorage.getItem("selected_package");
      if (savedPackage) {
        handlePackageSelection(new CustomEvent("package_selected", { detail: savedPackage }));
        localStorage.removeItem("selected_package");
      }

      const savedStyle = localStorage.getItem("selected_style");
      if (savedStyle) {
        handleStyleSelection(new CustomEvent("style_selected", { detail: savedStyle }));
        localStorage.removeItem("selected_style");
      }
    } catch (e) {
      console.warn("localStorage read/remove denied in Contact mount:", e);
    }

    return () => {
      window.removeEventListener("package_selected", handlePackageSelection);
      window.removeEventListener("style_selected", handleStyleSelection);
    };
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setActiveDropdown(null);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (isRateLimited) {
      alert(`Submission limit reached. Please wait ${Math.floor(timeRemaining / 60)}m ${timeRemaining % 60}s before submitting another brief.`);
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all required fields (Name, Email, Message)");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/.netlify/functions/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          business_name: formData.business_name || formData.company,
          company_size: formData.company_size,
          project_type: formData.projectType || "Custom Website",
          budget: formData.budget || "Not Specified",
          timeline: formData.timeline || "Flexible",
          country: formData.country,
          message: formData.message,
          source_page: window.location.pathname + window.location.hash,
          referral_source: formData.referral || "Direct",
        }),
      });

      if (response.status === 429) {
        const errData = await response.json().catch(() => ({}));
        alert(errData.error || "Too many submissions. Please try again after 5 minutes.");
        
        // Force Rate Limited State on client side
        try {
          const now = Date.now();
          const forcedTimes = [now, now, now];
          localStorage.setItem("contact_submissions_v1", JSON.stringify(forcedTimes));
          setSubmissionTimes(forcedTimes);
          setIsRateLimited(true);
          setTimeRemaining(errData.waitTime || 300);
        } catch (e) {}
        
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to save lead to CRM.");
      }

      // Record successful submission
      try {
        const validTimes = getValidSubmissions();
        const updatedTimes = [...validTimes, Date.now()];
        localStorage.setItem("contact_submissions_v1", JSON.stringify(updatedTimes));
        setSubmissionTimes(updatedTimes);
        if (updatedTimes.length >= 3) {
          setIsRateLimited(true);
          setTimeRemaining(300);
        }
      } catch (e) {
        console.warn("Could not save submission timestamp to localStorage:", e);
      }

      setIsLoading(false);
      setIsSuccessModalOpen(true);
      
      // Clear form
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        business_name: "",
        company_size: "1-10",
        projectType: "",
        budget: "",
        timeline: "",
        country: "India",
        referral: "",
        message: ""
      });

      // Intelligently trigger feedback popup 3 seconds after success
      setTimeout(() => {
        setIsFeedbackOpen(true);
      }, 3000);

    } catch (err: any) {
      console.error(err);
      alert("Error submitting request. Please try again or reach out directly.");
      setIsLoading(false);
    }
  };

  const toggleDropdown = (field: string) => {
    setActiveDropdown(prev => (prev === field ? null : field));
  };

  return (
    <section
      id="contact"
      className="pt-4 pb-12 sm:pt-8 sm:pb-24 bg-[#f5f5f7] dark:bg-[#09090b] transition-colors duration-300 relative noise-bg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          
          {/* Contact Info Side */}
          <div className="lg:col-span-5 flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-3.5 py-1.5 rounded-full border border-violet-100 dark:border-violet-900/50 self-center lg:self-start mb-6">
              Collaboration
            </span>
            <h2 className="text-4xl font-display font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.1] mb-6">
              Let's Build <br />
              Something <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500 dark:from-violet-400 dark:to-cyan-400">
                Remarkable
              </span>
            </h2>
            <p className="text-base text-zinc-650 dark:text-zinc-400 mb-4 lg:mb-8 max-w-sm mx-auto lg:mx-0">
              Tell us about your business metrics and software parameters. We review every brief personally and reply within 24 hours.
            </p>

            {/* Direct Contact Cards */}
            <div className="hidden lg:block space-y-4 max-w-sm mx-auto lg:mx-0 w-full text-left">
              <a
                href="mailto:sumansadhu0001@gmail.com"
                className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#161617]/95 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-violet-500 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-550">
                    Email Inquiries
                  </span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    sumansadhu0001@gmail.com
                  </span>
                </div>
              </a>

              <a
                href="tel:+919883581298"
                className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#161617]/95 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-violet-500 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-550">
                    WhatsApp Hotlines
                  </span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    +91 9883581298
                  </span>
                </div>
              </a>

              <a
                href="https://instagram.com/suman_web_design"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#161617]/95 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-violet-500 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-550">
                    Social Instagram
                  </span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    @suman_web_design
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Contact Real CRM Form Card */}
          <div className="lg:col-span-7" ref={dropdownRef}>
            <div className="bg-white dark:bg-[#161617]/95 rounded-3xl border border-violet-500/30 dark:border-violet-400/25 ring-1 ring-violet-500/15 dark:ring-violet-400/15 p-6 sm:p-10 shadow-2xl shadow-violet-500/5 dark:shadow-violet-950/25 relative overflow-hidden">
              {/* Ambient Internal Glow Elements */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-violet-600/10 to-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-tr from-cyan-500/5 to-violet-600/10 blur-3xl pointer-events-none rounded-full" />
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Suman Sadhu"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="client@company.com"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Phone / WhatsApp</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98835 81298"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  {/* Company Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Company / Business Name</label>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      placeholder="Bespoke Agency Ltd."
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Company size */}
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Company Size</label>
                    <div className="relative">
                      <select
                        name="company_size"
                        value={formData.company_size}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 hover:border-violet-500/50 dark:hover:border-violet-500/35 transition-all appearance-none cursor-pointer pr-10 shadow-sm dark:shadow-none"
                      >
                        <option value="1-10" className="bg-white dark:bg-[#121214] text-zinc-800 dark:text-zinc-200">1 – 10 Employees</option>
                        <option value="11-50" className="bg-white dark:bg-[#121214] text-zinc-800 dark:text-zinc-200">11 – 50 Employees</option>
                        <option value="51-200" className="bg-white dark:bg-[#121214] text-zinc-800 dark:text-zinc-200">51 – 200 Employees</option>
                        <option value="200+" className="bg-white dark:bg-[#121214] text-zinc-800 dark:text-zinc-200">200+ Employees</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500 transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="India"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Dropdowns row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Project Type */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Project Type</label>
                    <button
                      type="button"
                      onClick={() => toggleDropdown("projectType")}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white flex items-center justify-between hover:border-violet-500 transition-colors cursor-pointer"
                    >
                      <span className="truncate">{formData.projectType || "Select Type"}</span>
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === "projectType" && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-56 overflow-y-auto z-20"
                        >
                          {PROJECT_TYPES.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleDropdownSelect("projectType", type)}
                              className="w-full text-left px-4 py-2.5 text-xs hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:text-violet-600 dark:hover:text-violet-400 text-zinc-850 dark:text-zinc-200 transition-colors cursor-pointer"
                            >
                              {type}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Budget Selection */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Budget Range</label>
                    <button
                      type="button"
                      onClick={() => toggleDropdown("budget")}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white flex items-center justify-between hover:border-violet-500 transition-colors cursor-pointer"
                    >
                      <span className="truncate">{formData.budget || "Select Budget"}</span>
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === "budget" && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-56 overflow-y-auto z-20"
                        >
                          {BUDGET_RANGES.map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => handleDropdownSelect("budget", b)}
                              className="w-full text-left px-4 py-2.5 text-xs hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:text-violet-600 dark:hover:text-violet-400 text-zinc-850 dark:text-zinc-200 transition-colors cursor-pointer"
                            >
                              {b}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Timeline</label>
                    <button
                      type="button"
                      onClick={() => toggleDropdown("timeline")}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white flex items-center justify-between hover:border-violet-500 transition-colors cursor-pointer"
                    >
                      <span className="truncate">{formData.timeline || "Select Timeline"}</span>
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === "timeline" && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-56 overflow-y-auto z-20"
                        >
                          {TIMELINES.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleDropdownSelect("timeline", t)}
                              className="w-full text-left px-4 py-2.5 text-xs hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:text-violet-600 dark:hover:text-violet-400 text-zinc-850 dark:text-zinc-200 transition-colors cursor-pointer"
                            >
                              {t}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Referral Source */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">How did you hear about us?</label>
                  <button
                    type="button"
                    onClick={() => toggleDropdown("referral")}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white flex items-center justify-between hover:border-violet-500 transition-colors cursor-pointer"
                  >
                    <span className="truncate">{formData.referral || "Select Source"}</span>
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === "referral" && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-56 overflow-y-auto z-20"
                      >
                        {REFERRAL_SOURCES.map((refSource) => (
                          <button
                            key={refSource}
                            type="button"
                            onClick={() => handleDropdownSelect("referral", refSource)}
                            className="w-full text-left px-4 py-2.5 text-xs hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:text-violet-600 dark:hover:text-violet-400 text-zinc-850 dark:text-zinc-200 transition-colors cursor-pointer"
                          >
                            {refSource}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Message TextArea */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Project Brief / Message *</label>
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your software system deliverables, performance milestones, and design goals..."
                    className="w-full h-32 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500 transition-colors resize-none leading-normal"
                  />
                </div>

                {/* Rate limit status alert */}
                {isRateLimited ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-start gap-3 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500 animate-pulse" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold">Submission Limit Reached</p>
                      <p>To prevent spam, you can submit up to 3 contact briefs every 5 minutes. You can submit another brief in <span className="font-mono font-bold text-violet-600 dark:text-violet-400">{Math.floor(timeRemaining / 60)}m {timeRemaining % 60}s</span>.</p>
                    </div>
                  </div>
                ) : (
                  submissionTimes.length > 0 && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>Submissions in last 5 min: <span className="text-zinc-600 dark:text-zinc-200 font-bold">{submissionTimes.length}/3</span></span>
                      <span>{3 - submissionTimes.length} briefs remaining</span>
                    </div>
                  )
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || isRateLimited}
                  className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-zinc-950 hover:bg-violet-600 dark:bg-white dark:hover:bg-violet-500 text-white dark:text-zinc-950 dark:hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-violet-500/15 dark:hover:shadow-violet-500/10 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.862 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Connecting Suman Lead CRM...</span>
                    </>
                  ) : isRateLimited ? (
                    <span>Submissions Locked</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Project Brief →</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Direct Contact Cards (Mobile only) */}
          <div className="block lg:hidden space-y-4 max-w-sm mx-auto w-full text-left mt-6">
            <a
              href="mailto:sumansadhu0001@gmail.com"
              className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#161617]/95 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-violet-500 hover:shadow-md transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-550">
                  Email Inquiries
                </span>
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  sumansadhu0001@gmail.com
                </span>
              </div>
            </a>

            <a
              href="tel:+919883581298"
              className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#161617]/95 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-violet-500 hover:shadow-md transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-550">
                  WhatsApp Hotlines
                </span>
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  +91 9883581298
                </span>
              </div>
            </a>

            <a
              href="https://instagram.com/suman_web_design"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#161617]/95 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-violet-500 hover:shadow-md transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-550">
                  Social Instagram
                </span>
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  @suman_web_design
                </span>
              </div>
            </a>
          </div>

        </div>
      </div>

      {/* Popups & Modals */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onTrackInquiry={() => {
          // Open inquiry tracking if desired or simply show console confirmation
          console.log("Track inquiry action clicked.");
        }}
      />

      <FeedbackPopup
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </section>
  );
}
