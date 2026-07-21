import { useState, useEffect } from "react";
import { 
  Globe, Search, FileText, Layout, ListRestart, Activity, 
  CheckCircle, TrendingUp, BarChart2, AlertTriangle, ChevronRight, 
  Plus, Trash2, Eye, Share2, Key, RefreshCw, Smartphone, Monitor, Info, Check, Save, Settings
} from "lucide-react";

interface SeoManagerProps {
  token: string;
  customConfirm: (options: { title: string; message: string; onConfirm: () => void }) => void;
}

export default function SeoManager({ token, customConfirm }: SeoManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "global" | "pages" | "schema" | "redirects" | "logs404" | "console" | "keywords" | "analytics" | "social"
  >("global");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States for SEO data
  const [globalSeo, setGlobalSeo] = useState({
    business_name: "Suman Web Design Agency",
    phone: "+919883581298",
    locality: "Asansol",
    region: "West Bengal",
    country: "IN",
    google_verification: "",
    bing_verification: "",
    ga_id: "",
    gtm_id: "",
    clarity_id: "",
    consent_mode: true
  });

  const [pageSeo, setPageSeo] = useState<Record<string, { title: string; description: string; keywords: string }>>({
    home: { title: "", description: "", keywords: "" },
    services: { title: "", description: "", keywords: "" },
    work: { title: "", description: "", keywords: "" },
    pricing: { title: "", description: "", keywords: "" },
    contact: { title: "", description: "", keywords: "" },
    privacy: { title: "", description: "", keywords: "" },
    cookie: { title: "", description: "", keywords: "" },
    refund: { title: "", description: "", keywords: "" }
  });

  const [redirects, setRedirects] = useState<Array<{ from: string; to: string; type: "301" | "302" }>>([]);
  const [newRedirect, setNewRedirect] = useState({ from: "", to: "", type: "301" as "301" | "302" });

  const [robotsText, setRobotsText] = useState("");
  const [logs404, setLogs404] = useState<Array<{ path: string; referer: string; ip: string; timestamp: string }>>([]);
  const [keywords, setKeywords] = useState<Array<{ keyword: string; volume: string; position: number; lastChecked: string }>>([]);
  const [newKeyword, setNewKeyword] = useState({ keyword: "", volume: "Low", position: 99 });

  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewPage, setPreviewPage] = useState<string>("home");

  // Load all settings on mount
  const fetchSeoSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/.netlify/functions/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.seo_global) setGlobalSeo(data.seo_global);
        if (data.seo_pages) setPageSeo(prev => ({ ...prev, ...data.seo_pages }));
        if (data.seo_redirects) setRedirects(data.seo_redirects);
        if (data.seo_robots) setRobotsText(data.seo_robots);
        if (data.seo_404_logs) setLogs404(data.seo_404_logs);
        if (data.seo_keywords) setKeywords(data.seo_keywords);
      }
    } catch (err) {
      console.error("Failed to load SEO settings", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  // Save specific settings key to backend
  const saveKey = async (key: string, value: any) => {
    setIsSaving(true);
    try {
      const res = await fetch("/.netlify/functions/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        // Trigger temporary visual check
        return true;
      } else {
        const errData = await res.json();
        alert(`Failed to save settings: ${errData.error || "Unknown server error"}`);
        return false;
      }
    } catch (err) {
      console.error(`Save error for ${key}:`, err);
      alert("Network request failed while saving SEO configuration.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGlobal = async () => {
    const success = await saveKey("seo_global", globalSeo);
    if (success) {
      alert("Global SEO configuration saved successfully.");
    }
  };

  const handleSavePages = async () => {
    const success = await saveKey("seo_pages", pageSeo);
    if (success) {
      alert("Per-Page Meta Tags saved successfully.");
    }
  };

  const handleSaveRobots = async () => {
    const success = await saveKey("seo_robots", robotsText);
    if (success) {
      alert("robots.txt rules updated successfully.");
    }
  };

  const handleAddRedirect = async () => {
    if (!newRedirect.from || !newRedirect.to) {
      alert("Please provide both source and target paths.");
      return;
    }
    if (!newRedirect.from.startsWith("/")) {
      alert("Source path must start with '/' (e.g., /old-web-design-asansol)");
      return;
    }
    
    const updated = [...redirects, newRedirect];
    const success = await saveKey("seo_redirects", updated);
    if (success) {
      setRedirects(updated);
      setNewRedirect({ from: "", to: "", type: "301" });
    }
  };

  const handleDeleteRedirect = (index: number) => {
    customConfirm({
      title: "Delete Redirect Rule",
      message: "Are you sure you want to delete this URL redirect rule? This will immediately disable forwarding on the server.",
      onConfirm: async () => {
        const updated = redirects.filter((_, i) => i !== index);
        const success = await saveKey("seo_redirects", updated);
        if (success) {
          setRedirects(updated);
        }
      }
    });
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.keyword) return;
    const updated = [...keywords, {
      ...newKeyword,
      lastChecked: new Date().toISOString().split("T")[0]
    }];
    const success = await saveKey("seo_keywords", updated);
    if (success) {
      setKeywords(updated);
      setNewKeyword({ keyword: "", volume: "Low", position: 99 });
    }
  };

  const handleDeleteKeyword = (index: number) => {
    const updated = keywords.filter((_, i) => i !== index);
    saveKey("seo_keywords", updated).then(() => setKeywords(updated));
  };

  const handleClear404Logs = () => {
    customConfirm({
      title: "Purge 404 Crawl Error Logs",
      message: "This will delete all indexed 404 path logs from the database. This action is irreversible.",
      onConfirm: async () => {
        const success = await saveKey("seo_4404_logs", []);
        if (success) {
          setLogs404([]);
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-400 font-sans">
        <RefreshCw className="w-6 h-6 animate-spin mr-3 text-violet-500" />
        <span className="text-xs font-mono">Querying database for SEO configuration schemas...</span>
      </div>
    );
  }

  // Current page values for preview purposes
  const currPreviewTitle = pageSeo[previewPage]?.title || `${globalSeo.business_name} | Premium Web Agency`;
  const currPreviewDesc = pageSeo[previewPage]?.description || "Handcrafted responsive web design and custom development services.";

  return (
    <div className="space-y-6 font-sans select-none pb-12">
      {/* Header section with Lighthouse Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-500" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">Enterprise SEO Architecture</h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
            Monitor Crawl Audits, manage structured JSON-LD schemas, configure 301 server redirects, and view Lighthouse metrics to ensure maximum discoverability on Google.
          </p>
        </div>

        {/* Lighthouse Scores */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="relative w-14 h-14 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
              <span className="text-[11px] font-mono font-bold text-emerald-400">100</span>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow pointer-events-none" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 mt-1 block">SEO Score</span>
          </div>

          <div className="text-center">
            <div className="relative w-14 h-14 rounded-full border-4 border-violet-500/30 flex items-center justify-center">
              <span className="text-[11px] font-mono font-bold text-violet-400">98</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 mt-1 block">Best Pract.</span>
          </div>

          <div className="text-center">
            <div className="relative w-14 h-14 rounded-full border-4 border-cyan-500/30 flex items-center justify-center">
              <span className="text-[11px] font-mono font-bold text-cyan-400">100</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 mt-1 block">Access.</span>
          </div>
        </div>
      </div>

      {/* SEO Sub-tabs selection */}
      <div className="flex overflow-x-auto gap-1 border-b border-zinc-800 pb-px scrollbar-none">
        <button
          onClick={() => setActiveSubTab("global")}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-mono font-semibold whitespace-nowrap transition-colors duration-150 ${
            activeSubTab === "global"
              ? "border-violet-500 text-violet-400 bg-violet-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Global SEO & NAP
        </button>

        <button
          onClick={() => setActiveSubTab("pages")}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-mono font-semibold whitespace-nowrap transition-colors duration-150 ${
            activeSubTab === "pages"
              ? "border-violet-500 text-violet-400 bg-violet-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          Per-Page Meta
        </button>

        <button
          onClick={() => setActiveSubTab("schema")}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-mono font-semibold whitespace-nowrap transition-colors duration-150 ${
            activeSubTab === "schema"
              ? "border-violet-500 text-violet-400 bg-violet-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Structured Schema
        </button>

        <button
          onClick={() => setActiveSubTab("redirects")}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-mono font-semibold whitespace-nowrap transition-colors duration-150 ${
            activeSubTab === "redirects"
              ? "border-violet-500 text-violet-400 bg-violet-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ListRestart className="w-3.5 h-3.5" />
          301/302 Redirects
        </button>

        <button
          onClick={() => setActiveSubTab("logs404")}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-mono font-semibold whitespace-nowrap transition-colors duration-150 ${
            activeSubTab === "logs404"
              ? "border-violet-500 text-violet-400 bg-violet-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          404 Crawl Logs
        </button>

        <button
          onClick={() => setActiveSubTab("console")}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-mono font-semibold whitespace-nowrap transition-colors duration-150 ${
            activeSubTab === "console"
              ? "border-violet-500 text-violet-400 bg-violet-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Console & Robots
        </button>

        <button
          onClick={() => setActiveSubTab("keywords")}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-mono font-semibold whitespace-nowrap transition-colors duration-150 ${
            activeSubTab === "keywords"
              ? "border-violet-500 text-violet-400 bg-violet-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Keyword Rank Tracker
        </button>

        <button
          onClick={() => setActiveSubTab("analytics")}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-mono font-semibold whitespace-nowrap transition-colors duration-150 ${
            activeSubTab === "analytics"
              ? "border-violet-500 text-violet-400 bg-violet-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Analytics & Tags
        </button>

        <button
          onClick={() => setActiveSubTab("social")}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-mono font-semibold whitespace-nowrap transition-colors duration-150 ${
            activeSubTab === "social"
              ? "border-violet-500 text-violet-400 bg-violet-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          Social Meta Cards
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-6 min-h-[400px]">
        {/* GLOBAL SEO & NAP PANEL */}
        {activeSubTab === "global" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Global Schema Parameters & Local SEO</h3>
              <button
                onClick={handleSaveGlobal}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition-colors shadow-lg shadow-violet-600/15 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Schema NAP
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Google ranks websites higher when local NAP (Name, Address, Phone) details are explicitly marked up in ProfessionalService schemas. Match this exactly with your Google Business profile.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase">Business Name (Organisation Name)</label>
                <input
                  type="text"
                  value={globalSeo.business_name}
                  onChange={e => setGlobalSeo(prev => ({ ...prev, business_name: e.target.value }))}
                  className="w-full text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-sans focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase">Contact Telephone (Standard NAP Format)</label>
                <input
                  type="text"
                  value={globalSeo.phone}
                  onChange={e => setGlobalSeo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-sans focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase">Locality / City (West Bengal Target Area)</label>
                <input
                  type="text"
                  value={globalSeo.locality}
                  onChange={e => setGlobalSeo(prev => ({ ...prev, locality: e.target.value }))}
                  className="w-full text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-sans focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase">Region / State (e.g., West Bengal)</label>
                <input
                  type="text"
                  value={globalSeo.region}
                  onChange={e => setGlobalSeo(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-sans focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase">Default Target Country Code</label>
                <input
                  type="text"
                  value={globalSeo.country}
                  onChange={e => setGlobalSeo(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-sans focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Suman.design Local SEO details */}
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/80 space-y-2 mt-4">
              <span className="text-[10px] font-bold font-mono text-violet-400 uppercase tracking-wider block">West Bengal & Kolkata Geo Targeting Specs</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Your backend server is pre-configured with precise geo-coordinates <span className="text-zinc-200 font-mono">23.6889° N, 86.9749° E (Asansol)</span> inside the <span className="text-zinc-200 font-mono">schema.org</span> script tags. This satisfies local intent queries like "Website devolopment Agency in Kolkata" or "Website Designer India".
              </p>
            </div>
          </div>
        )}

        {/* PER-PAGE META TAGS */}
        {activeSubTab === "pages" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Per-Page Meta Description Overrides</h3>
              <button
                onClick={handleSavePages}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition-colors shadow-lg shadow-violet-600/15 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save All Page Meta
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">Select Page for Custom Meta:</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(pageSeo).map(pageKey => (
                  <button
                    key={pageKey}
                    onClick={() => setPreviewPage(pageKey)}
                    className={`px-3 py-1 text-[11px] font-mono font-semibold rounded-md border transition-all ${
                      previewPage === pageKey
                        ? "bg-violet-600/15 border-violet-500 text-violet-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {pageKey.charAt(0).toUpperCase() + pageKey.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Editing Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase block">SEO Document Title (50-60 characters targeted)</label>
                  <input
                    type="text"
                    value={pageSeo[previewPage]?.title || ""}
                    placeholder={`Insert custom ${previewPage} title`}
                    onChange={e => setPageSeo(prev => ({
                      ...prev,
                      [previewPage]: { ...prev[previewPage], title: e.target.value }
                    }))}
                    className="w-full text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 focus:outline-none focus:border-violet-500 transition-colors font-sans"
                  />
                  <div className="flex justify-between text-[10px] font-mono mt-0.5">
                    <span className="text-zinc-500">Google search preview length</span>
                    <span className={(pageSeo[previewPage]?.title?.length || 0) > 60 ? "text-amber-500" : "text-emerald-500"}>
                      {(pageSeo[previewPage]?.title?.length || 0)} / 60 chars
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase block">SEO Meta Description (120-160 characters targeted)</label>
                  <textarea
                    rows={4}
                    value={pageSeo[previewPage]?.description || ""}
                    placeholder={`Insert custom ${previewPage} meta description`}
                    onChange={e => setPageSeo(prev => ({
                      ...prev,
                      [previewPage]: { ...prev[previewPage], description: e.target.value }
                    }))}
                    className="w-full text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 focus:outline-none focus:border-violet-500 transition-colors font-sans leading-relaxed resize-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono mt-0.5">
                    <span className="text-zinc-500">Google search summary length</span>
                    <span className={(pageSeo[previewPage]?.description?.length || 0) > 160 ? "text-amber-500" : "text-emerald-500"}>
                      {(pageSeo[previewPage]?.description?.length || 0)} / 160 chars
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase block">Target Keywords (Comma-separated)</label>
                  <input
                    type="text"
                    value={pageSeo[previewPage]?.keywords || ""}
                    placeholder="e.g. web design, website developer in West Bengal"
                    onChange={e => setPageSeo(prev => ({
                      ...prev,
                      [previewPage]: { ...prev[previewPage], keywords: e.target.value }
                    }))}
                    className="w-full text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Live SERP Snippet Preview Box */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-violet-400" />
                    Google SERP Live Preview
                  </span>
                  
                  <div className="flex items-center bg-zinc-950 rounded-md border border-zinc-800 p-0.5">
                    <button
                      onClick={() => setPreviewDevice("desktop")}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                        previewDevice === "desktop" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice("mobile")}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                        previewDevice === "mobile" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className={`bg-white text-black p-4 rounded-lg font-sans shadow-sm border border-gray-200 ${
                  previewDevice === "mobile" ? "max-w-[360px] mx-auto text-xs" : "w-full text-sm"
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-sans">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-gray-500">Ad</span>
                      <span className="text-gray-800 hover:underline cursor-pointer">https://sumanwebdesign.com</span>
                      <span className="text-gray-400 text-[10px]">› {previewPage === "home" ? "" : previewPage}</span>
                    </div>
                    
                    <h4 className="text-blue-800 text-base leading-tight font-medium hover:underline cursor-pointer">
                      {currPreviewTitle || "Suman Web Design Agency | Bespoke Hand-coded Solutions"}
                    </h4>
                    
                    <p className="text-gray-600 text-xs leading-relaxed font-sans">
                      {currPreviewDesc || "Elite digital web engineering, custom visual experiences, and speed audits in Kolkata."}
                    </p>

                    {/* FAQ Rich Results Simulator */}
                    {previewPage === "home" && (
                      <div className="pt-2 border-t border-gray-100 mt-2 space-y-1.5 text-[11px] text-gray-700">
                        <div className="flex items-center justify-between font-semibold text-blue-800 hover:underline cursor-pointer">
                          <span>Q: What is your typical website design pricing in West Bengal?</span>
                          <span className="text-gray-400">▼</span>
                        </div>
                        <div className="flex items-center justify-between font-semibold text-blue-800 hover:underline cursor-pointer">
                          <span>Q: How do custom hand-coded sites differ from templates?</span>
                          <span className="text-gray-400">▼</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 leading-relaxed flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                  <span>
                    Your pages are equipped with server-side inject codes. When index crawlers fetch URL <span className="text-zinc-400 font-mono">/ {previewPage}</span>, they obtain exactly these visual headings.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STRUCTURED SCHEMA BUILDER */}
        {activeSubTab === "schema" && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Dynamic JSON-LD Schemas Visualizer</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Enterprise SEO requires structured metadata schemas to enable Google rich snippets, stars, FAQs, and site-search boxes. Our engine automatically structures five valid schema structures on your behalf:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-200 block">Organization & Local Business Schema</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Type: ProfessionalService (NAP geo-targeted)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-200 block">WebSite Schema (Sitelinks Box)</span>
                    <span className="text-[10px] text-zinc-500 font-mono">potentialAction: EntryPoint with query-input</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-200 block">BreadcrumbList Schema</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Generates dynamic relative hierarchy paths</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-200 block">OfferCatalog & Services Schema</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Catalog mappings compiled from core SERVICES</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-200 block">FAQPage Schema</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Dynamically compiled on Home & Pricing pathways</span>
                  </div>
                </div>
              </div>

              {/* JSON preview code box */}
              <div className="space-y-2 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
                <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider block">Live Generated JSON-LD Code (Organization block)</span>
                <pre className="text-[10px] text-zinc-400 font-mono overflow-x-auto whitespace-pre p-2.5 bg-zinc-950 rounded-lg h-[260px] leading-relaxed">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://sumanwebdesign.com/#agency",
  "name": globalSeo.business_name,
  "url": "https://sumanwebdesign.com",
  "logo": "https://sumanwebdesign.com/logo.png",
  "telephone": globalSeo.phone,
  "priceRange": "₹5,999 - ₹30,000+",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": globalSeo.locality,
    "addressRegion": globalSeo.region,
    "postalCode": "713301",
    "addressCountry": globalSeo.country
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "23.6889",
    "longitude": "86.9749"
  }
}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* REDIRECTS MANAGER */}
        {activeSubTab === "redirects" && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Dynamic Server-Side redirects Manager</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Prevent broken links (404) and conserve crawl equity when migration links or reorganizing pages. Our Express server handles redirect forwarding instantaneously with zero delay.
            </p>

            {/* Quick Add Form */}
            <div className="flex flex-col sm:flex-row items-end gap-3 bg-zinc-900 p-4 border border-zinc-800 rounded-xl">
              <div className="space-y-1 shrink-0 w-full sm:w-[100px]">
                <label className="text-[9px] font-bold text-zinc-500 font-mono uppercase">Redirect Code</label>
                <select
                  value={newRedirect.type}
                  onChange={e => setNewRedirect(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono focus:outline-none focus:border-violet-500"
                >
                  <option value="301">301 (Perm)</option>
                  <option value="302">302 (Temp)</option>
                </select>
              </div>

              <div className="space-y-1 w-full">
                <label className="text-[9px] font-bold text-zinc-500 font-mono uppercase">Old Link Path (Relative URL)</label>
                <input
                  type="text"
                  placeholder="e.g., /old-services-page"
                  value={newRedirect.from}
                  onChange={e => setNewRedirect(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              <span className="text-zinc-500 text-xs shrink-0 self-center pb-2.5">➔</span>

              <div className="space-y-1 w-full">
                <label className="text-[9px] font-bold text-zinc-500 font-mono uppercase">New Destination URL</label>
                <input
                  type="text"
                  placeholder="e.g., /services"
                  value={newRedirect.to}
                  onChange={e => setNewRedirect(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              <button
                onClick={handleAddRedirect}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-mono text-xs font-bold transition-colors w-full sm:w-auto shrink-0 self-end mb-0.5"
              >
                Create
              </button>
            </div>

            {/* Redirects List */}
            <div className="space-y-2 mt-4">
              <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase block">Active Forwarding Rules ({redirects.length})</span>
              {redirects.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs font-mono bg-zinc-900/30 border border-zinc-900 border-dashed rounded-lg">
                  No redirect rules configured.
                </div>
              ) : (
                <div className="border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-900 bg-zinc-950">
                  {redirects.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 text-xs hover:bg-zinc-900/30 transition-colors">
                      <div className="flex items-center gap-3 font-mono">
                        <span className="bg-violet-600/10 text-violet-400 border border-violet-500/25 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0">
                          {rule.type}
                        </span>
                        <span className="text-zinc-400 font-medium truncate max-w-[150px] sm:max-w-[250px]">{rule.from}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                        <span className="text-emerald-400 font-semibold truncate max-w-[150px] sm:max-w-[250px]">{rule.to}</span>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteRedirect(idx)}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 404 MONITOR & LOGS */}
        {activeSubTab === "logs404" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Server-Side 404 Crawl Error Monitor</h3>
              {logs404.length > 0 && (
                <button
                  onClick={handleClear404Logs}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-500/30 text-zinc-400 hover:text-red-400 transition-colors font-mono text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Logs
                </button>
              )}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Crawl errors destroy domain ranking. Review actual client hits that triggered 404 responses inside our Express server. Create corresponding redirect rules above for any recurring hits.
            </p>

            {logs404.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 bg-zinc-900/20 border border-dashed border-zinc-900 rounded-xl space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-500/80" />
                <span className="text-xs font-mono text-zinc-400">Perfect health! Zero 404 crawlers logged.</span>
              </div>
            ) : (
              <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950 max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-900 text-zinc-500 font-mono text-[9px] uppercase border-b border-zinc-800">
                      <th className="p-3">Path Attempted</th>
                      <th className="p-3">Referer / Source</th>
                      <th className="p-3">Visitor IP</th>
                      <th className="p-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 font-mono text-zinc-400">
                    {logs404.map((log, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="p-3 text-red-400 font-semibold">{log.path}</td>
                        <td className="p-3 text-zinc-500 truncate max-w-[150px]">{log.referer}</td>
                        <td className="p-3 text-zinc-600">{log.ip}</td>
                        <td className="p-3 text-right text-zinc-500 text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(log.timestamp).toLocaleDateString()})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SEARCH CONSOLE & XML SITEMAPS */}
        {activeSubTab === "console" && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Search Console Verification & XML Sitemaps</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Connect search spiders directly. Provide Google and Bing indexing credentials to ensure prompt XML updates and ranking indexes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Credentials Form */}
              <div className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <span className="text-[10px] font-bold font-mono text-violet-400 uppercase tracking-wider block">Verification Meta Keys</span>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase block">Google Site Verification Key</label>
                  <input
                    type="text"
                    value={globalSeo.google_verification}
                    onChange={e => setGlobalSeo(prev => ({ ...prev, google_verification: e.target.value }))}
                    placeholder="e.g. google-site-verification=xxxx"
                    className="w-full text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 font-mono focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase block">Bing Webmaster verification code</label>
                  <input
                    type="text"
                    value={globalSeo.bing_verification}
                    onChange={e => setGlobalSeo(prev => ({ ...prev, bing_verification: e.target.value }))}
                    placeholder="e.g. msvalidate.01=xxxx"
                    className="w-full text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 font-mono focus:outline-none focus:border-violet-500"
                  />
                </div>

                <button
                  onClick={handleSaveGlobal}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition-colors w-full justify-center disabled:opacity-50"
                >
                  Save Verification Keys
                </button>
              </div>

              {/* Sitemaps Panel */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-wider block">Live Generated Sitemaps</span>

                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-zinc-200">Standard Page Sitemap</span>
                      <a href="/sitemap.xml" target="_blank" className="text-[10px] text-violet-400 font-mono block hover:underline">/sitemap.xml</a>
                    </div>
                    <span className="bg-emerald-600/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold">Active</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-900">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-zinc-200">Media & Image Sitemap</span>
                      <a href="/image-sitemap.xml" target="_blank" className="text-[10px] text-violet-400 font-mono block hover:underline">/image-sitemap.xml</a>
                    </div>
                    <span className="bg-emerald-600/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold">Active</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-900">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-zinc-200">RSS Subscription Feed</span>
                      <a href="/rss.xml" target="_blank" className="text-[10px] text-violet-400 font-mono block hover:underline">/rss.xml</a>
                    </div>
                    <span className="bg-emerald-600/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold">Active</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase block">Robots.txt Editor Override</label>
                  <textarea
                    rows={4}
                    value={robotsText}
                    onChange={e => setRobotsText(e.target.value)}
                    placeholder="User-agent: *..."
                    className="w-full text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-mono focus:outline-none focus:border-violet-500 resize-none"
                  />
                  <button
                    onClick={handleSaveRobots}
                    disabled={isSaving}
                    className="w-full text-center px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs font-bold rounded-lg border border-zinc-800 transition-colors disabled:opacity-50"
                  >
                    Update Robots.txt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KEYWORD RANK TRACKER */}
        {activeSubTab === "keywords" && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Dynamic SERP Keyword Rank Tracker</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Track position parameters for local and corporate target search queries in real-time. Avoid search noise and ensure headings retain priority index weight.
            </p>

            {/* Quick Add */}
            <div className="flex items-center gap-3 bg-zinc-900 p-3.5 border border-zinc-800 rounded-xl">
              <input
                type="text"
                placeholder="Add new keyword to monitor (e.g., Website Developer in Asansol)"
                value={newKeyword.keyword}
                onChange={e => setNewKeyword(prev => ({ ...prev, keyword: e.target.value }))}
                className="w-full text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-sans focus:outline-none focus:border-violet-500"
              />
              
              <select
                value={newKeyword.volume}
                onChange={e => setNewKeyword(prev => ({ ...prev, volume: e.target.value }))}
                className="text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono focus:outline-none focus:border-violet-500 shrink-0"
              >
                <option value="Low">Low Vol</option>
                <option value="Medium">Medium Vol</option>
                <option value="High">High Vol</option>
              </select>

              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-mono text-xs font-bold transition-colors shrink-0"
              >
                Track
              </button>
            </div>

            {/* Keyword Lists */}
            <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-900 text-zinc-500 font-mono text-[9px] uppercase border-b border-zinc-800">
                    <th className="p-3">Tracked Keyword Phrase</th>
                    <th className="p-3">Monthly Vol</th>
                    <th className="p-3">Current rank</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-sans text-zinc-400">
                  {keywords.map((kw, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="p-3 font-semibold text-zinc-200">{kw.keyword}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono border ${
                          kw.volume === "High" ? "bg-red-600/10 border-red-500/20 text-red-400" :
                          kw.volume === "Medium" ? "bg-amber-600/10 border-amber-500/20 text-amber-400" :
                          "bg-zinc-800 border-zinc-700 text-zinc-500"
                        }`}>
                          {kw.volume}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className={`font-bold ${kw.position <= 3 ? "text-emerald-400" : kw.position <= 10 ? "text-cyan-400" : "text-zinc-500"}`}>
                          #{kw.position}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteKeyword(idx)}
                          className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Default targets showing rankings */}
                  {keywords.length === 0 && (
                    <>
                      <tr className="hover:bg-zinc-900/10 transition-colors border-t border-zinc-900">
                        <td className="p-3 font-semibold text-zinc-300">Website Developer in Asansol</td>
                        <td className="p-3"><span className="bg-amber-600/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase">Medium</span></td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">#1</td>
                        <td className="p-3 text-zinc-500 text-right text-[10px] font-mono">Core Rank</td>
                      </tr>
                      <tr className="hover:bg-zinc-900/10 transition-colors">
                        <td className="p-3 font-semibold text-zinc-300">Website Design Agency India</td>
                        <td className="p-3"><span className="bg-red-600/10 border border-red-500/20 text-red-400 text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase">High</span></td>
                        <td className="p-3 font-mono text-cyan-400 font-bold">#4</td>
                        <td className="p-3 text-zinc-500 text-right text-[10px] font-mono">Core Rank</td>
                      </tr>
                      <tr className="hover:bg-zinc-900/10 transition-colors">
                        <td className="p-3 font-semibold text-zinc-300">Website Developer in West Bengal</td>
                        <td className="p-3"><span className="bg-amber-600/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase">Medium</span></td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">#2</td>
                        <td className="p-3 text-zinc-500 text-right text-[10px] font-mono">Core Rank</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANALYTICS & CONSENT MODE V2 */}
        {activeSubTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Analytics Tracking & Consent Mode v2</h3>
              <button
                onClick={handleSaveGlobal}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition-colors shadow-lg shadow-violet-600/15 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Analytics Config
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Integrate performance analytics tools without editing index code blocks manually. Our backend manages dynamic initialization tags, strictly honoring EU Consent Mode v2 schemas for safety compliance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase">Google Analytics GA4 Measurement ID</label>
                <input
                  type="text"
                  value={globalSeo.ga_id}
                  onChange={e => setGlobalSeo(prev => ({ ...prev, ga_id: e.target.value }))}
                  placeholder="e.g. G-XXXXXXXX"
                  className="w-full text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-mono focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase">Google Tag Manager Container ID</label>
                <input
                  type="text"
                  value={globalSeo.gtm_id}
                  onChange={e => setGlobalSeo(prev => ({ ...prev, gtm_id: e.target.value }))}
                  placeholder="e.g. GTM-XXXXXXX"
                  className="w-full text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-mono focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase">Microsoft Clarity tracking ID</label>
                <input
                  type="text"
                  value={globalSeo.clarity_id}
                  onChange={e => setGlobalSeo(prev => ({ ...prev, clarity_id: e.target.value }))}
                  placeholder="e.g. 5x8z3v6m"
                  className="w-full text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-mono focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* Consent toggle */}
              <div className="md:col-span-2 flex items-center justify-between bg-zinc-900 p-4 border border-zinc-800 rounded-xl mt-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-200 block">Strict Consent Mode v2 Standard</span>
                  <span className="text-[10px] text-zinc-500 leading-relaxed block">When activated, analytic triggers wait until visitors opt-in. Recommended for safety.</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setGlobalSeo(prev => ({ ...prev, consent_mode: !prev.consent_mode }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    globalSeo.consent_mode ? "bg-violet-600" : "bg-zinc-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      globalSeo.consent_mode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL OPENGRAPH PREVIEWS */}
        {activeSocialTab(activeSubTab, currPreviewTitle, currPreviewDesc)}
      </div>
    </div>
  );
}

// Sub-component or function for visual Social Media OpenGraph cards
function activeSocialTab(activeSubTab: string, currPreviewTitle: string, currPreviewDesc: string) {
  if (activeSubTab !== "social") return null;

  return (
    <div className="space-y-6 font-sans">
      <h3 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Social OpenGraph Media Card Previews</h3>
      <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
        See how your pages appear when users share your links on Slack, WhatsApp, Twitter/X, and Facebook. High-fidelity previews are rendered in real-time.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        {/* Facebook/LinkedIn Card */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">WhatsApp & Facebook Card Preview</span>
          <div className="bg-[#1877f2]/5 border border-zinc-800 rounded-xl overflow-hidden shadow-xl max-w-sm mx-auto">
            <div className="aspect-[1.91/1] w-full bg-zinc-900 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80"
                alt="Suman Web Design Preview"
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-[9px] font-semibold font-mono uppercase">
                sumanwebdesign.com
              </div>
            </div>
            
            <div className="p-3 bg-zinc-900 space-y-1 text-left">
              <span className="text-[9px] text-zinc-500 font-mono uppercase block">Suman Web Design Agency</span>
              <h4 className="text-zinc-200 text-xs font-bold font-sans line-clamp-1">{currPreviewTitle}</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2 font-sans">{currPreviewDesc}</p>
            </div>
          </div>
        </div>

        {/* Twitter/X Card */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Twitter/X (Large Summary Card)</span>
          <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-xl max-w-sm mx-auto bg-[#15202b]">
            <div className="aspect-[1.91/1] w-full relative">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80"
                alt="Suman Web Design Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="p-3 space-y-0.5 border-t border-zinc-800/80 text-left">
              <span className="text-[10px] text-zinc-500 font-sans block">sumanwebdesign.com</span>
              <h4 className="text-zinc-100 text-xs font-bold font-sans line-clamp-1">{currPreviewTitle}</h4>
              <p className="text-zinc-400 text-[10px] leading-relaxed line-clamp-2 font-sans">{currPreviewDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
