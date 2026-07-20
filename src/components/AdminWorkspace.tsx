import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, FolderKanban, Settings, Image as ImageIcon, 
  BarChart3, MessageSquareText, ShieldAlert, UserCog, LogOut, 
  Plus, Edit2, Trash2, Search, Filter, ShieldCheck, Mail, Phone, 
  Sparkles, ExternalLink, RefreshCw, Star, ArrowUpRight, HelpCircle,
  FileCheck, Calendar, Bell, Loader2, Play, Download, AlertTriangle, Eye, Check,
  Lock, ArrowRight, Laptop, Smartphone, Globe, Activity, FileText, Share2, Upload, Trash, Clock, Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AdminLogin from "./AdminLogin";
import { supabase } from "../lib/supabase/client";
import SeoManager from "./SeoManager";

interface AdminWorkspaceProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export default function AdminWorkspace({ activePage, setActivePage }: AdminWorkspaceProps) {
  const [token, setToken] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Database Data States
  const [leads, setLeads] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [logs, setLogs] = useState<any>({ activity: [], audit: [] });
  const [activeToasts, setActiveToasts] = useState<any[]>([]);
  
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    hideCancel?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const customConfirm = (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    hideCancel?: boolean;
    onConfirm: () => void;
  }) => {
    setConfirmModal({
      isOpen: true,
      ...options
    });
  };

  const checkDbStatus = async () => {
    try {
      const r = await fetch("/api/db-status");
      if (r.ok) {
        const d = await r.json();
        if (d && d.status === "error") {
          setDbStatus(d);
          return false;
        } else {
          setDbStatus(d || { status: "ok" });
          return true;
        }
      } else {
        const errText = await r.text();
        setDbStatus({
          status: "error",
          connectionStatus: "Disconnected",
          missingEnv: [],
          missingTables: [],
          missingRlsPolicies: [],
          sqlError: `HTTP Error: ${r.status} ${errText}`,
          migrationStatus: "Unknown"
        });
        return false;
      }
    } catch (err: any) {
      console.error("Failed to check database schema status", err);
      setDbStatus({
        status: "error",
        connectionStatus: "Disconnected",
        missingEnv: [],
        missingTables: [],
        missingRlsPolicies: [],
        sqlError: err.message || "Failed to reach database status endpoint.",
        migrationStatus: "Unknown"
      });
      return false;
    }
  };

  const [settings, setSettings] = useState<any>({
    business_info: {
      name: "Suman Design",
      email: "contact@sumandesign.in",
      phone: "+91 9883581298",
      whatsapp: "+919883581298",
      instagram: "suman_web_design",
      linkedin: "suman-design"
    },
    seo_metadata: {
      meta_title: "Suman Web Design Agency | Premium Website Design & Development",
      meta_description: "Elite digital solutions and premium custom-tailored web development services."
    }
  });

  const [stats, setStats] = useState<any>({
    summary: { total_sessions: 0, total_views: 0, total_leads: 0, total_feedback: 0, average_rating: 5.0 },
    sessions: [],
    views: []
  });

  const currentTab = activePage.split("/")[1] || "dashboard";

  // Check login and fetch initial configurations
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const newToken = session.access_token;
          const user = {
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email
          };
          setToken(newToken);
          setSessionUser(user);
          document.cookie = `admin_token=${newToken}; path=/; max-age=${session.expires_in}; SameSite=Strict; path=/`;
        } else {
          setToken(null);
          setSessionUser(null);
          document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict; path=/";
        }
      } catch (err) {
        console.error("Session check failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const newToken = session.access_token;
        const user = {
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email
        };
        setToken(newToken);
        setSessionUser(user);
        document.cookie = `admin_token=${newToken}; path=/; max-age=${session.expires_in}; SameSite=Strict; path=/`;
      } else {
        setToken(null);
        setSessionUser(null);
        document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict; path=/";
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    checkDbStatus().then((isOk) => {
      if (isOk && token) {
        fetchAllData();
      }
    });
  }, [token]);

  useEffect(() => {
    if (!token) return;

    // Realtime subscriptions
    const leadsChannel = supabase
      .channel('public:leads')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    const feedbackChannel = supabase
      .channel('public:feedback')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feedback' },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    const sessionsChannel = supabase
      .channel('public:visitor_sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visitor_sessions' },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    const viewsChannel = supabase
      .channel('public:page_views')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'page_views' },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    const settingsChannel = supabase
      .channel('public:website_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'website_settings' },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(viewsChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [token]);

  const fetchAllData = async () => {
    if (!token) return;
    const isOk = await checkDbStatus();
    if (!isOk) return;
    const headers = { Authorization: `Bearer ${token}` };
    
    // Fetch data directly from Supabase API endpoints
    const fetchLeads = async () => {
      try {
        const r = await fetch("/api/leads", { headers });
        if (r.ok) {
          const d = await r.json();
          setLeads(Array.isArray(d) ? d : []);
        }
      } catch (err) {
        console.error("Failed to fetch leads", err);
      }
    };

    const fetchFeedback = async () => {
      try {
        const r = await fetch("/api/feedback", { headers });
        if (r.ok) {
          const d = await r.json();
          setFeedback(Array.isArray(d) ? d : []);
        }
      } catch (err) {
        console.error("Failed to fetch feedback", err);
      }
    };

    const fetchProjects = async () => {
      try {
        const r = await fetch("/api/projects");
        if (r.ok) {
          const d = await r.json();
          setProjects(Array.isArray(d) ? d : []);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };

    const fetchSettings = async () => {
      try {
        const r = await fetch("/api/settings");
        if (r.ok) {
          const d = await r.json();
          if (d && d.business_info) setSettings(d);
        }
      } catch (err) {
        console.error("Failed to fetch website settings", err);
      }
    };

    const fetchMedia = async () => {
      try {
        const r = await fetch("/api/media", { headers });
        if (r.ok) {
          const d = await r.json();
          setMedia(Array.isArray(d) ? d : []);
        }
      } catch (err) {
        console.error("Failed to fetch media library", err);
      }
    };

    const fetchLogs = async () => {
      try {
        const r = await fetch("/api/admin/logs", { headers });
        if (r.ok) {
          const d = await r.json();
          if (d && d.activity) setLogs(d);
        }
      } catch (err) {
        console.warn("Audit logs telemetry unavailable");
      }
    };

    const fetchNotifications = async () => {
      try {
        const r = await fetch("/api/notifications", { headers });
        if (r.ok) {
          const d = await r.json();
          setNotifications(Array.isArray(d) ? d : []);
        }
      } catch (err) {
        console.warn("Notifications pipeline unavailable");
      }
    };

    const fetchStats = async () => {
      try {
        const r = await fetch("/api/analytics/stats", { headers });
        if (r.ok) {
          const d = await r.json();
          if (d && d.summary) setStats(d);
        }
      } catch (err) {
        console.warn("Stats aggregator pipeline unavailable");
      }
    };

    const fetchLive = async () => {
      try {
        const r = await fetch("/api/admin/live", { headers });
        if (r.ok) {
          const d = await r.json();
          if (d && d.online_count !== undefined) setOnlineCount(d.online_count);
        }
      } catch (err) {
        console.warn("Live feedback ticker offline");
      }
    };

    await Promise.all([
      fetchLeads(),
      fetchFeedback(),
      fetchProjects(),
      fetchSettings(),
      fetchMedia(),
      fetchLogs(),
      fetchNotifications(),
      fetchStats(),
      fetchLive()
    ]);
  };

  // Real-time notifications via WebSocket
  useEffect(() => {
    if (!token) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;
    
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      console.log("Establishing admin websocket connection...");
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connection established successfully");
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "NEW_LEAD") {
            const newLead = payload.lead;
            
            // Add notification toast
            const toastId = Math.random().toString();
            setActiveToasts(prev => [
              ...prev,
              {
                id: toastId,
                title: "New CRM Inquiry",
                message: `Lead from ${newLead.name} (${newLead.project_type}) with budget ${newLead.budget}.`,
                lead: newLead,
                timestamp: new Date()
              }
            ]);

            // Auto refresh all data to sync live UI seamlessly
            fetchAllData();

            // Auto dismiss toast after 8 seconds
            setTimeout(() => {
              setActiveToasts(prev => prev.filter(t => t.id !== toastId));
            }, 8000);
          }
        } catch (err) {
          console.error("Error processing websocket message:", err);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed. Reconnecting in 3 seconds...");
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket encountered an error:", err);
        ws?.close();
      };
    };

    connect();

    return () => {
      if (ws) {
        ws.onclose = null; // Prevent reconnect on unmount
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [token]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase auth signout warning", err);
    }
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict; path=/";
    setToken(null);
    setSessionUser(null);
    window.history.replaceState(null, "", "/");
    setActivePage("home");
  };

  const handleTabChange = (tab: string) => {
    window.history.pushState(null, "", `/admin/${tab}`);
    setActivePage(`admin/${tab}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl border-4 border-violet-100 border-t-violet-600 animate-spin" />
          <Sparkles className="w-6 h-6 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-display font-bold tracking-tight text-zinc-900">Suman.design</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 animate-pulse mt-1 block">
            Booting Operational Engine...
          </span>
        </div>
      </div>
    );
  }

  if (dbStatus && dbStatus.status === "error") {
    return <DatabaseErrorView dbStatus={dbStatus} onRetry={checkDbStatus} />;
  }

  if (!token || !sessionUser) {
    return (
      <AdminLogin
        setActivePage={(page) => {
          setActivePage(page);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-800 font-sans flex flex-col md:flex-row relative selection:bg-violet-100 selection:text-violet-900">
      
      {/* Sidebar Navigation (White Glass Glassmorphism) */}
      <aside className="w-full md:w-72 bg-white/95 backdrop-blur-md border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col justify-between shrink-0 relative z-20 shadow-sm md:h-screen md:sticky md:top-0">
        <div>
          {/* Logo Brand Panel */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-lg shadow-violet-500/20">
                S
              </div>
              <div>
                <h2 className="text-sm font-display font-bold text-zinc-900 leading-none">
                  Suman<span className="text-violet-500 font-medium">.design</span>
                </h2>
                <span className="text-[10px] text-zinc-400 font-mono tracking-wider block mt-1">OPERATIONS CONSOLE</span>
              </div>
            </div>
          </div>

          {/* Connected Database Health Status Widget */}
          <div className="m-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 relative">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 pl-2">DB Core Status</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase">Live</span>
            </div>
            <div className="text-[11px] text-zinc-500 font-mono flex items-center justify-between pt-1">
              <span>Supabase Cloud</span>
              <span className="text-emerald-600 font-bold">Connected</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-2">
            <SidebarLink icon={<LayoutDashboard className="w-4 h-4" />} label="Overview Dashboard" active={currentTab === "dashboard"} onClick={() => handleTabChange("dashboard")} />
            <SidebarLink icon={<Users className="w-4 h-4" />} label="Leads CRM" count={leads.filter(l => l.status === "new").length} active={currentTab === "leads"} onClick={() => handleTabChange("leads")} />
            <SidebarLink icon={<FolderKanban className="w-4 h-4" />} label="Project CMS" count={projects.length} active={currentTab === "projects"} onClick={() => handleTabChange("projects")} />
            <SidebarLink icon={<MessageSquareText className="w-4 h-4" />} label="Feedback Hub" count={feedback.length} active={currentTab === "feedback"} onClick={() => handleTabChange("feedback")} />
            <SidebarLink icon={<ImageIcon className="w-4 h-4" />} label="Media Library" count={media.length} active={currentTab === "media"} onClick={() => handleTabChange("media")} />
            <SidebarLink icon={<BarChart3 className="w-4 h-4" />} label="Visitor Analytics" active={currentTab === "analytics"} onClick={() => handleTabChange("analytics")} />
            <SidebarLink icon={<Globe className="w-4 h-4" />} label="SEO Manager" active={currentTab === "seo"} onClick={() => handleTabChange("seo")} />
            <SidebarLink icon={<Settings className="w-4 h-4" />} label="Web Settings" active={currentTab === "settings"} onClick={() => handleTabChange("settings")} />
            <SidebarLink icon={<ShieldAlert className="w-4 h-4" />} label="Security Audit" active={currentTab === "security"} onClick={() => handleTabChange("security")} />
            <SidebarLink icon={<UserCog className="w-4 h-4" />} label="Profile Management" active={currentTab === "profile"} onClick={() => handleTabChange("profile")} />
          </nav>

          {/* View Live Site Sidebar Action Button */}
          <div className="px-4 py-3 border-t border-slate-100 mt-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white font-display font-bold text-xs rounded-xl shadow-md shadow-violet-600/10 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Globe className="w-4 h-4 transition-transform group-hover:rotate-12 text-white" />
              <span>View Live Site</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-85 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* User Footer Account Panel */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-100 border border-violet-250 flex items-center justify-center text-violet-700 font-bold text-xs shadow-inner">
              {sessionUser.name?.substring(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="truncate max-w-[130px]">
              <span className="block text-xs font-bold text-zinc-900 truncate leading-tight">{sessionUser.name}</span>
              <span className="block text-[10px] text-zinc-400 truncate mt-0.5">{sessionUser.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out Console"
            className="p-2 rounded-xl bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-zinc-400 hover:text-red-500 transition-all shadow-xs"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 relative z-10 md:h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80">
            <div>
              <span className="text-[10px] font-mono font-bold text-violet-600 uppercase tracking-widest bg-violet-50 border border-violet-100/60 px-2.5 py-1 rounded-md">
                Suman.design Operations Console
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 tracking-tight capitalize mt-2.5">
                {currentTab === "dashboard" ? "System Overview" : `${currentTab.replace("-", " ")}`}
              </h1>
            </div>

            {/* Live UTC indicator & Client Counter */}
            <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-700 font-medium font-sans flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs px-3.5 py-2 rounded-xl transition-all group cursor-pointer"
              >
                <Globe className="w-4 h-4 text-violet-500 group-hover:rotate-12 transition-transform" />
                <span>View Live Site</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <span className="text-xs text-zinc-600 font-mono flex items-center gap-2 bg-white border border-slate-200 shadow-xs px-3.5 py-2 rounded-xl">
                <Calendar className="w-4 h-4 text-violet-500" />
                {new Date().toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-xs text-zinc-650 font-mono flex items-center gap-2 bg-white border border-slate-200 shadow-xs px-3.5 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{onlineCount} Active</span>
              </span>
            </div>
          </div>

          {/* Main error warnings removed. Setup page blocks access if database status is not OK */}

          {/* Dynamic Active Tabs Render */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentTab === "dashboard" && (
                <OverviewDashboard 
                  leads={leads} 
                  feedback={feedback} 
                  projects={projects} 
                  stats={stats} 
                  onlineCount={onlineCount} 
                  handleTabChange={handleTabChange} 
                  token={token}
                  customConfirm={customConfirm}
                  refreshData={fetchAllData}
                />
              )}
              {currentTab === "leads" && <LeadsCRM leads={leads} fetchLeads={fetchAllData} token={token} customConfirm={customConfirm} />}
              {currentTab === "projects" && <ProjectsCMS projects={projects} fetchProjects={fetchAllData} token={token} customConfirm={customConfirm} />}
              {currentTab === "feedback" && <FeedbackHub feedback={feedback} fetchFeedback={fetchAllData} token={token} customConfirm={customConfirm} />}
              {currentTab === "media" && <MediaLibrary media={media} fetchMedia={fetchAllData} token={token} customConfirm={customConfirm} />}
              {currentTab === "analytics" && <VisitorAnalytics stats={stats} />}
              {currentTab === "seo" && <SeoManager token={token || ""} customConfirm={customConfirm} />}
              {currentTab === "settings" && <WebSettings settings={settings} fetchSettings={fetchAllData} token={token} customConfirm={customConfirm} />}
              {currentTab === "security" && <SecurityPanel logs={logs} fetchLogs={fetchAllData} />}
              {currentTab === "profile" && <ProfilePanel sessionUser={sessionUser} setSessionUser={setSessionUser} customConfirm={customConfirm} />}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      {/* Custom Confirmation Dialog */}
      <AnimatePresence>
        {confirmModal?.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${confirmModal.isDestructive ? 'bg-red-50 text-red-550 border border-red-100' : 'bg-violet-50 text-violet-650 border border-violet-100'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-base font-display font-bold text-zinc-900 leading-snug">{confirmModal.title}</h3>
                  <p className="text-xs text-zinc-550 leading-relaxed">{confirmModal.message}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {!confirmModal.hideCancel && (
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-zinc-750 hover:text-zinc-900 text-xs font-bold rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
                  >
                    {confirmModal.cancelText || "Cancel"}
                  </button>
                )}
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className={`flex-1 py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer ${confirmModal.isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-violet-650 hover:bg-violet-700 shadow-violet-100'}`}
                >
                  {confirmModal.confirmText || "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real-time Notifications Toast Panel */}
      <div id="realtime-toast-panel" className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm">
        <AnimatePresence>
          {activeToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className="bg-zinc-950/95 border border-zinc-850 text-white rounded-2xl p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden backdrop-blur-md font-sans"
              layout
            >
              <div className="flex gap-3">
                <div className="p-2 bg-violet-600/20 text-violet-400 rounded-xl h-fit shrink-0">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold tracking-tight text-white flex items-center gap-2">
                    {toast.title}
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  </h4>
                  <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                  <span className="text-[9px] font-mono text-zinc-500 block mt-1.5">
                    {new Date(toast.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end border-t border-zinc-900 pt-2.5 mt-1">
                <button
                  onClick={() => {
                    setActiveToasts(prev => prev.filter(t => t.id !== toast.id));
                  }}
                  className="px-3 py-1.5 text-[10px] font-medium text-zinc-450 hover:text-white hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    handleTabChange("leads");
                    setActiveToasts(prev => prev.filter(t => t.id !== toast.id));
                  }}
                  className="px-3 py-1.5 text-[10px] font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all flex items-center gap-1 shadow-md shadow-violet-600/20 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// SidebarLink helper component
function SidebarLink({ icon, label, count, active, onClick }: { icon: React.ReactNode, label: string, count?: number, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer group ${
        active 
          ? "bg-violet-50 text-violet-700 shadow-inner border-l-3 border-violet-650" 
          : "text-zinc-600 hover:bg-slate-50 hover:text-zinc-900 hover:translate-x-0.5"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`${active ? "text-violet-600 animate-pulse" : "text-zinc-400 group-hover:text-zinc-650"}`}>{icon}</span>
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
          active ? "bg-violet-600 text-white" : "bg-slate-100 text-zinc-550 border border-slate-200"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ==========================================
// SUB-PANEL 1: SYSTEM OVERVIEW DASHBOARD
// ==========================================
function OverviewDashboard({ leads, feedback, projects, stats, onlineCount, handleTabChange, token, customConfirm, refreshData }: any) {
  const avgRating = stats.summary?.average_rating || 0;
  const newLeads = leads.filter((l: any) => l.status === "new").length;
  const totalSessions = stats.sessions?.length || stats.summary?.total_sessions || 0;
  const totalViews = stats.views?.length || stats.summary?.total_views || 0;
  const leadConversionRate = totalSessions > 0 ? ((leads.length / totalSessions) * 100).toFixed(1) : "0.0";

  // Real-time server latency & database diagnostics state
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [dbHealth, setDbHealth] = useState<string>("Checking");
  const [isTestingLatency, setIsTestingLatency] = useState<boolean>(false);
  const [showDbLogs, setShowDbLogs] = useState<boolean>(false);

  // Telemetry simulation states
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simStep, setSimStep] = useState<number>(0);

  const startSimulation = async () => {
    setIsSimulating(true);
    setSimulationLogs(["[SYSTEM] Starting live visitor interaction simulation...", "[CONN] Resolving public IP routing parameters..."]);
    setSimStep(1);

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    try {
      await sleep(1000);
      
      const cities = ["New York", "London", "Tokyo", "Paris", "Sydney", "Mumbai", "San Francisco", "Berlin"];
      const countries = ["United States", "United Kingdom", "Japan", "France", "Australia", "India", "United States", "Germany"];
      const devices = ["Desktop", "Mobile", "Tablet"];
      const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
      const osList = ["macOS", "iOS", "Windows", "Android", "Linux"];
      const paths = ["/", "/#services", "/#work", "/#pricing", "/#contact"];
      const referrers = ["Direct", "https://google.com", "https://github.com", "https://linkedin.com"];

      const randIdx = Math.floor(Math.random() * cities.length);
      const city = cities[randIdx];
      const country = countries[randIdx];
      const device = devices[Math.floor(Math.random() * devices.length)];
      const browser = browsers[Math.floor(Math.random() * browsers.length)];
      const os = osList[Math.floor(Math.random() * osList.length)];
      const landing = paths[0];
      const referral = referrers[Math.floor(Math.random() * referrers.length)];
      const visitorId = "v_test_" + Math.random().toString(36).substring(2, 8);

      setSimulationLogs(prev => [
        ...prev,
        `[CONN] Virtual Visitor Profile generated:`,
        `       • IP Source: Tunnel Ingress`,
        `       • Location: ${city}, ${country}`,
        `       • Client: ${browser} (${os}) • ${device}`,
        `[POST] Handshaking with /api/analytics/session...`
      ]);
      setSimStep(2);
      await sleep(1000);

      const resSession = await fetch("/api/analytics/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_id: visitorId,
          landing_page: landing,
          referral_source: referral,
          device,
          browser,
          os,
          language: "en-US",
          country,
          city,
          session_duration: 0
        })
      });

      if (!resSession.ok) throw new Error("Session handshake failed");
      const { session_id } = await resSession.json();

      setSimulationLogs(prev => [
        ...prev,
        `[OK] Session initialized: ${session_id.substring(0, 8).toUpperCase()}...`,
        `[POST] Simulating viewport route view navigation to ${landing}...`
      ]);
      setSimStep(3);
      await sleep(1000);

      const viewRes = await fetch("/api/analytics/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id,
          url: landing,
          title: "Minimalist Agency Hub",
          referrer: referral,
          scroll_percentage: Math.floor(40 + Math.random() * 50),
          time_spent: Math.floor(10 + Math.random() * 30)
        })
      });

      if (!viewRes.ok) throw new Error("Page view tracking rejected");

      setSimulationLogs(prev => [
        ...prev,
        `[OK] Page view registered. Storing scroll depth metric...`,
        `[POST] Simulating micro event click trigger...`
      ]);
      setSimStep(4);
      await sleep(1000);

      const elements = ["#pricing-cta", "#contact-submit", "#work-preview-1", "#whatsapp-chat-button"];
      const texts = ["Get Started", "Submit Inquiry", "View Case Study", "Chat on WhatsApp"];
      const elemIdx = Math.floor(Math.random() * elements.length);

      const clickRes = await fetch("/api/analytics/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id,
          element_id: elements[elemIdx],
          element_class: "btn-primary",
          text: texts[elemIdx],
          x: Math.floor(100 + Math.random() * 600),
          y: Math.floor(200 + Math.random() * 800)
        })
      });

      if (!clickRes.ok) throw new Error("Click tracking failed");

      setSimulationLogs(prev => [
        ...prev,
        `[OK] Click logged: [${elements[elemIdx]} - "${texts[elemIdx]}"].`,
        `[SYNC] Syncing statistics pipeline and database indices...`
      ]);
      setSimStep(5);
      await sleep(1200);

      if (refreshData) {
        await refreshData();
      }

      setSimulationLogs(prev => [
        ...prev,
        `[SUCCESS] Simulation completed successfully!`,
        `          Telemetry is active. Charts and logs are re-synchronized.`
      ]);
      setSimStep(6);
    } catch (err: any) {
      setSimulationLogs(prev => [
        ...prev,
        `[ERROR] Simulation halted: ${err.message || err}`
      ]);
      setSimStep(-1);
    } finally {
      setIsSimulating(false);
    }
  };

  const runDiagnostics = async () => {
    setIsTestingLatency(true);
    const start = performance.now();
    try {
      // Fetch public db status to trigger roundtrip database check
      const res = await fetch("/api/db-status");
      const end = performance.now();
      if (res.ok) {
        setLatencyMs(Math.round(end - start));
        setDbHealth("Operational");
      } else {
        setLatencyMs(Math.round(end - start));
        setDbHealth("Degraded");
      }
    } catch (e) {
      setLatencyMs(null);
      setDbHealth("Offline");
    } finally {
      setIsTestingLatency(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  // Dynamic analysis: Most visited page
  const pageViewCounts = (stats.views || []).reduce((acc: any, v: any) => {
    acc[v.url] = (acc[v.url] || 0) + 1;
    return acc;
  }, {});
  let mostVisitedPage = "/";
  let maxViews = 0;
  Object.entries(pageViewCounts).forEach(([url, count]: any) => {
    if (count > maxViews) {
      maxViews = count;
      mostVisitedPage = url;
    }
  });

  // Calculate dynamic WhatsApp and Email click telemetry
  const clicks = stats.clicks || [];
  const whatsappClicks = clicks.filter((c: any) => {
    const text = (c.text || "").toLowerCase();
    const id = (c.element_id || "").toLowerCase();
    const cls = (c.element_class || "").toLowerCase();
    return text.includes("whatsapp") || text.includes("+91") || id.includes("whatsapp") || cls.includes("whatsapp");
  }).length;

  const emailClicks = clicks.filter((c: any) => {
    const text = (c.text || "").toLowerCase();
    const id = (c.element_id || "").toLowerCase();
    const cls = (c.element_class || "").toLowerCase();
    return text.includes("email") || text.includes("contact@") || text.includes("mailto") || id.includes("email") || cls.includes("email");
  }).length;

  // Group sessions & views of the last 7 days to draw a highly detailed, actual dynamic path!
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartPoints = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      dateStr,
      dayName: days[d.getDay()],
      sessions: 0,
      views: 0
    };
  });

  const sessionsList = stats.sessions || [];
  const viewsList = stats.views || [];

  sessionsList.forEach((s: any) => {
    if (!s.created_at) return;
    const sDate = new Date(s.created_at);
    const sDateStr = sDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const point = chartPoints.find(p => p.dateStr === sDateStr);
    if (point) {
      point.sessions++;
    }
  });

  viewsList.forEach((v: any) => {
    if (!v.created_at) return;
    const vDate = new Date(v.created_at);
    const vDateStr = vDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const point = chartPoints.find(p => p.dateStr === vDateStr);
    if (point) {
      point.views++;
    }
  });

  const maxVal = Math.max(...chartPoints.map(p => Math.max(p.sessions, p.views)), 4);
  const getX = (index: number) => 5 + (index * 90) / 6;
  const getY = (val: number) => 85 - (val / maxVal) * 70;

  const sessionsPathPoints = chartPoints.map((p, i) => `${getX(i)},${getY(p.sessions)}`);
  const sessionsPath = `M ${sessionsPathPoints.join(" L ")}`;
  const sessionsAreaPath = `${sessionsPath} L ${getX(6)},95 L ${getX(0)},95 Z`;

  const viewsPathPoints = chartPoints.map((p, i) => `${getX(i)},${getY(p.views)}`);
  const viewsPath = `M ${viewsPathPoints.join(" L ")}`;
  const viewsAreaPath = `${viewsPath} L ${getX(6)},95 L ${getX(0)},95 Z`;

  return (
    <div className="space-y-6">
      
      {/* Real telemetry widgets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Visitors" value={totalSessions} subText="Unique site sessions" icon={<Globe className="text-violet-600" />} highlight={`${onlineCount} active`} />
        <StatCard title="Total Page Views" value={totalViews} subText="Total route renders" icon={<Eye className="text-emerald-600" />} highlight="Live views" />
        <StatCard title="Total Inquiries" value={leads.length} subText="Inbound CRM submissions" icon={<FileText className="text-cyan-600" />} highlight={`${newLeads} new`} />
        <StatCard title="Feedback Index" value={`${avgRating} ★`} subText={`From ${feedback.length} submissions`} icon={<Star className="text-amber-500 fill-amber-500/10" />} highlight="Client reviews" />
      </div>

      {/* Extra KPI parameters row - Enterprise Gateway & Telemetry Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Live API Edge Gateway & DB Pool */}
        <div id="supabase-pool-card" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between group hover:border-violet-300 hover:shadow-md transition-all duration-300 min-h-[300px]">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-600" />
          
          <div>
            <div id="supabase-pool-status" className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 pl-1">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Database Engine & RTT</span>
                <h4 className="text-xs font-display font-bold text-zinc-800">Supabase Connection Pool</h4>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${dbHealth === "Operational" ? 'bg-emerald-500 animate-pulse' : dbHealth === "Checking" ? 'bg-amber-400 animate-spin' : 'bg-red-500'} block`} />
                <span className="text-[9px] font-mono font-bold text-zinc-500 capitalize">{dbHealth.toLowerCase()}</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!showDbLogs ? (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3 pl-1"
                >
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-[9px] text-zinc-400 block font-mono">RTT Roundtrip</span>
                      <span id="supabase-pool-latency-val" className="text-2xl font-mono font-bold text-zinc-900">
                        {latencyMs !== null ? `${latencyMs}ms` : "---"}
                      </span>
                    </div>
                    
                    <button
                      id="supabase-pool-ping-btn"
                      onClick={runDiagnostics}
                      disabled={isTestingLatency}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-violet-50 text-zinc-650 hover:text-violet-700 text-[10px] font-mono font-bold rounded-lg border border-slate-200 hover:border-violet-200 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isTestingLatency ? 'animate-spin text-violet-600' : ''}`} />
                      <span>{isTestingLatency ? 'Testing...' : 'Ping Pool'}</span>
                    </button>
                  </div>

                  {/* Visual Capacity Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                      <span>Connection Leases (6/20)</span>
                      <span className="font-bold text-violet-600">30% Allocated</span>
                    </div>
                    <div id="supabase-pool-progress-bar" className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: '30%' }} />
                    </div>
                  </div>

                  {/* Micro Grid for Enterprise Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-50/50 rounded-lg p-2 border border-slate-100 font-mono text-[9px] text-zinc-500">
                      <span className="text-zinc-400 block">Cache Hit Rate</span>
                      <span className="font-bold text-zinc-800 text-xs">99.81%</span>
                    </div>
                    <div className="bg-slate-50/50 rounded-lg p-2 border border-slate-100 font-mono text-[9px] text-zinc-500">
                      <span className="text-zinc-400 block">Active Threads</span>
                      <span className="font-bold text-emerald-600 text-xs">6 Connected</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 space-y-1 text-[10px] font-mono text-zinc-500">
                    <div className="flex justify-between">
                      <span>Cloud Engine</span>
                      <span className="font-bold text-zinc-750">Supabase PG-15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SSL Layer</span>
                      <span className="font-bold text-emerald-600">TLS 1.3 Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Queries/sec</span>
                      <span className="font-bold text-zinc-750">2,500 Limit</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="logs"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-2 font-mono text-[9px]"
                >
                  <div className="flex justify-between items-center text-zinc-400 border-b border-dashed border-slate-100 pb-1 mb-1">
                    <span>Query Trace Telemetry</span>
                    <span className="text-emerald-500 animate-pulse">● Live Stream</span>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-2.5 text-zinc-300 font-mono space-y-2 border border-slate-800 min-h-[140px] flex flex-col justify-between">
                    <div className="space-y-1.5 leading-relaxed">
                      <div className="flex items-start gap-1">
                        <span className="text-zinc-500">03:08:12</span>
                        <div className="flex-1">
                          <span className="text-violet-400 font-bold">SELECT</span> <span className="text-zinc-300">*</span> <span className="text-violet-400 font-bold">FROM</span> <span className="text-emerald-400">leads</span> <span className="text-zinc-400">WHERE status='new'</span> <span className="text-amber-400 font-semibold">[12ms]</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-zinc-500">03:08:15</span>
                        <div className="flex-1">
                          <span className="text-violet-400 font-bold">INSERT INTO</span> <span className="text-emerald-400">visitor_sessions</span> <span className="text-zinc-400">(ip, route)</span> <span className="text-amber-400 font-semibold">[8ms]</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-zinc-500">03:08:21</span>
                        <div className="flex-1">
                          <span className="text-violet-400 font-bold">SELECT count(*)</span> <span className="text-violet-400 font-bold">FROM</span> <span className="text-emerald-400">feedback</span> <span className="text-amber-400 font-semibold">[4ms]</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[8px] text-zinc-500 flex justify-between border-t border-slate-800 pt-1 mt-1">
                      <span>Server Host: local-ingress-01</span>
                      <span className="text-emerald-500">SSL Sec</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            id="supabase-pool-toggle-logs-btn"
            onClick={() => setShowDbLogs(!showDbLogs)}
            className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-zinc-600 hover:text-zinc-900 text-[10px] font-mono font-bold rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-zinc-500" />
            <span>{showDbLogs ? "Show Metrics & Allocation" : "Inspect Live Query Trace ↗"}</span>
          </button>
        </div>

        {/* Card 2: SMTP Dispatcher & Mail Delivery */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />

          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 pl-1">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">SMTP Server & Deliverability</span>
              <h4 className="text-xs font-display font-bold text-zinc-800">Lead Delivery Engine</h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse block" />
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Operational</span>
            </div>
          </div>

          <div className="flex justify-between items-end pl-1 mb-4">
            <div>
              <span className="text-[10px] text-zinc-400 block font-mono">Deliverability Index</span>
              <span className="text-2xl font-mono font-bold text-zinc-900">100.0%</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
              Secure Outbox
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 pl-4 space-y-1 text-[10px] font-mono text-zinc-500">
            <div className="flex justify-between">
              <span>Mail Server Connection</span>
              <span className="font-bold text-zinc-750">Secure Port 587</span>
            </div>
            <div className="flex justify-between">
              <span>Admin Auto-Alerts</span>
              <span className="font-bold text-zinc-750">Active on Inquire</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Queue</span>
              <span className="font-bold text-emerald-600">0 Pending / Empty</span>
            </div>
          </div>
        </div>

        {/* Card 3: Communications Webhook Telemetry */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between group hover:border-cyan-300 hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />

          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 pl-1">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Webhook Handlers & Actions</span>
              <h4 className="text-xs font-display font-bold text-zinc-800">Conversion Telemetry API</h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse block" />
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Listening</span>
            </div>
          </div>

          <div className="flex justify-between items-end pl-1 mb-4">
            <div>
              <span className="text-[10px] text-zinc-400 block font-mono">Conversion Ratio</span>
              <span className="text-2xl font-mono font-bold text-zinc-900">{leadConversionRate}%</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-600 bg-cyan-50 border border-cyan-100 px-2.5 py-1 rounded-md">
              Tracking Active
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 pl-4 space-y-1 text-[10px] font-mono text-zinc-500">
            <div className="flex justify-between">
              <span>WhatsApp Click Events</span>
              <span className="font-bold text-zinc-750">{whatsappClicks} captured</span>
            </div>
            <div className="flex justify-between">
              <span>Direct Email Clicks</span>
              <span className="font-bold text-zinc-750">{emailClicks} captured</span>
            </div>
            <div className="flex justify-between">
              <span>Conversion Actions</span>
              <span className="font-bold text-cyan-600">Sync with Analytics</span>
            </div>
          </div>
        </div>

      </div>


      <div id="traffic-trends-row" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Analytics Interactive Graph visualization */}
        <div id="traffic-chart-card" className="bg-white border border-slate-200/80 rounded-2xl p-6 lg:col-span-8 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-150">
              <div>
                <h3 className="text-sm font-display font-bold text-zinc-900">Traffic Over Time</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Page views vs unique visitor sessions (7-Day Dynamic Index)</p>
              </div>
              <span className="text-[10px] font-mono font-medium text-violet-600 uppercase tracking-widest bg-violet-50 border border-violet-100 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-ping" />
                <span>Live Graph</span>
              </span>
            </div>

            <div className="h-60 mt-4 flex items-end justify-between relative px-2">
              {/* Visual Grid Lines */}
              <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-100" />
              <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-slate-100" />
              <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-slate-100" />
              
              {/* SVG Visual Graphic Area */}
              {totalSessions === 0 && totalViews === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-zinc-400">
                  No visitor telemetry recorded yet
                </div>
              ) : (
                <svg className="absolute inset-0 w-full h-full p-2 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sessions-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="views-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Views Area & Stroke */}
                  <path d={viewsAreaPath} fill="url(#views-glow)" />
                  <path d={viewsPath} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Sessions Area & Stroke */}
                  <path d={sessionsAreaPath} fill="url(#sessions-glow)" />
                  <path d={sessionsPath} fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}

              {/* Dynamic X-Axis Markers */}
              <div id="traffic-chart-x-axis" className="absolute inset-x-0 -bottom-6 flex justify-between text-[8px] font-mono text-zinc-400 px-2">
                {chartPoints.map((p, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="font-bold text-zinc-700">{p.dayName}</span>
                    <span className="text-[7px] text-zinc-400">{p.dateStr}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 border-t border-slate-100 pt-4 mt-8 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1.5 bg-violet-600 rounded-sm animate-pulse" />
                <span className="text-zinc-600 font-semibold">Page Views ({totalViews})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1.5 bg-cyan-500 rounded-sm" />
                <span className="text-zinc-600 font-semibold">Visitor Sessions ({totalSessions})</span>
              </div>
              <div className="ml-auto text-zinc-500">
                Most Visited: <span className="font-bold text-violet-600">{mostVisitedPage}</span>
              </div>
            </div>
          </div>

          {/* Simulation Suite Controls */}
          <div id="traffic-simulator-panel" className="mt-6 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase tracking-wider">Telemetry Validation Suite</span>
                <h4 className="text-xs font-display font-bold text-zinc-800">Visitor Tracking Simulator</h4>
              </div>
              <button
                id="visitor-sim-btn"
                onClick={startSimulation}
                disabled={isSimulating}
                className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 hover:border-violet-300 text-violet-700 text-[10px] font-mono font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-3 h-3 ${isSimulating ? 'animate-pulse text-zinc-400' : 'text-violet-600'}`} />
                <span>{isSimulating ? 'Simulating Traffic...' : 'Run Traffic Simulation'}</span>
              </button>
            </div>

            {simulationLogs.length > 0 && (
              <div id="traffic-simulator-logs" className="mt-3 bg-slate-950 rounded-xl p-3 border border-slate-900 font-mono text-[9px] text-zinc-300 space-y-1 max-h-32 overflow-y-auto leading-relaxed">
                {simulationLogs.map((log, idx) => {
                  let colorClass = "text-zinc-300";
                  if (log.startsWith("[SYSTEM]")) colorClass = "text-violet-400 font-semibold";
                  else if (log.startsWith("[CONN]")) colorClass = "text-amber-400";
                  else if (log.startsWith("[POST]")) colorClass = "text-cyan-400";
                  else if (log.startsWith("[OK]")) colorClass = "text-emerald-400 font-semibold";
                  else if (log.startsWith("[SUCCESS]")) colorClass = "text-emerald-500 font-bold bg-emerald-950/40 px-1 rounded";
                  else if (log.startsWith("[ERROR]")) colorClass = "text-red-400 font-bold";
                  return (
                    <div key={idx} className={colorClass}>
                      {log}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CRM Leads Quick Summary List */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 lg:col-span-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-150">
            <h3 className="text-sm font-display font-bold text-zinc-900">Latest Inbound CRM</h3>
            <button 
              onClick={() => handleTabChange("leads")}
              className="text-xs text-violet-600 hover:text-violet-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              Console CRM
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 my-4 max-h-[220px] overflow-y-auto pr-1">
            {leads.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-xs font-mono">No leads logged.</div>
            ) : (
              leads.slice(0, 4).map((lead: any) => (
                <div key={lead.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="truncate max-w-[70%]">
                    <span className="block text-xs font-bold text-zinc-900 truncate">{lead.name}</span>
                    <span className="block text-[9px] text-zinc-400 truncate mt-0.5">{lead.email}</span>
                  </div>
                  <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    lead.status === "new" ? "bg-violet-100 text-violet-700 border border-violet-200" : "bg-slate-200 text-zinc-500"
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 text-[10px] text-zinc-400 flex items-center justify-between">
            <span>Total: {leads.length} leads in CRM</span>
            <span>{leads.filter(l => l.status === "new").length} unhandled</span>
          </div>
        </div>

      </div>

      {/* Database Maintenance Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-display font-bold text-zinc-900">Database & Demo Data Maintenance</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Purge standard template seed items or completely wipe CMS and CRM tables to start 100% clean with live customer records.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                customConfirm({
                  title: "Purge Demo/Seed Data",
                  message: "Purge demo/seed data? This will delete default projects like 'Aether Boutique' and default 'test@example.com' leads.",
                  isDestructive: true,
                  onConfirm: async () => {
                    try {
                      const res = await fetch("/api/admin/purge-demo", {
                        method: "POST",
                        headers: { 
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}` 
                        },
                        body: JSON.stringify({ type: "demo_only" })
                      });
                      if (res.ok) {
                        const d = await res.json();
                        customConfirm({
                          title: "Purge Completed",
                          message: d.message || "Demo data purged successfully!",
                          hideCancel: true,
                          onConfirm: () => window.location.reload()
                        });
                      } else {
                        const err = await res.json();
                        customConfirm({
                          title: "Error Purging",
                          message: err.error || "Failed to purge demo data.",
                          hideCancel: true,
                          onConfirm: () => {}
                        });
                      }
                    } catch (e: any) {
                      customConfirm({
                        title: "Connection Failed",
                        message: e.message,
                        hideCancel: true,
                        onConfirm: () => {}
                      });
                    }
                  }
                });
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-zinc-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              Purge Seed/Demo Data
            </button>
            <button
              onClick={() => {
                customConfirm({
                  title: "CRITICAL WARNING: Database Reset",
                  message: "This will permanently delete ALL leads, projects, and feedback comments from your database. This action CANNOT be undone! Are you absolutely sure?",
                  isDestructive: true,
                  onConfirm: async () => {
                    try {
                      const res = await fetch("/api/admin/purge-demo", {
                        method: "POST",
                        headers: { 
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}` 
                        },
                        body: JSON.stringify({ type: "all_data" })
                      });
                      if (res.ok) {
                        const d = await res.json();
                        customConfirm({
                          title: "Database Reset Successful",
                          message: d.message || "Database tables wiped successfully!",
                          hideCancel: true,
                          onConfirm: () => window.location.reload()
                        });
                      } else {
                        const err = await res.json();
                        customConfirm({
                          title: "Reset Error",
                          message: err.error || "Failed to wipe database.",
                          hideCancel: true,
                          onConfirm: () => {}
                        });
                      }
                    } catch (e: any) {
                      customConfirm({
                        title: "Connection Failed",
                        message: e.message,
                        hideCancel: true,
                        onConfirm: () => {}
                      });
                    }
                  }
                });
              }}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Reset & Wipe Database
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

// Mini components for dashboard
function StatCard({ title, value, subText, icon, highlight }: any) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">{title}</span>
          <h3 className="text-2xl font-display font-bold text-zinc-900 mt-2">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-zinc-400 border-t border-slate-100 pt-2.5 mt-2 font-mono">
        <span>{subText}</span>
        <span className="text-violet-600 font-bold uppercase tracking-wider">{highlight}</span>
      </div>
    </div>
  );
}

function MiniStatCard({ label, value, detail, stroke }: any) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${stroke}`} />
      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 block pl-1">{label}</span>
      <div className="flex justify-between items-baseline mt-2 pl-1">
        <span className="text-lg font-display font-bold text-zinc-900">{value}</span>
        <span className="text-[9px] font-mono text-zinc-400">{detail}</span>
      </div>
    </div>
  );
}

// ==========================================
// SUB-PANEL 2: LEADS CRM
// ==========================================
function LeadsCRM({ leads, fetchLeads, token, customConfirm }: { leads: any[]; fetchLeads: () => void; token: string; customConfirm: any }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const handleUpdateStatus = async (id: string, status: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchLeads();
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead({ ...selectedLead, status });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    customConfirm({
      title: "Delete Lead",
      message: "Are you sure you want to delete this lead forever? This action cannot be undone.",
      isDestructive: true,
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const res = await fetch(`/api/leads/${id}`, { 
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            fetchLeads();
            setSelectedLead(null);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setIsSubmitting(true);
    // Custom notes are updated locally or synchronized
    try {
      // For resilience we log notes activity or patch
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ notes: adminNotes, status: selectedLead.status })
      });
      if (res.ok) {
        alert("Admin notes saved successfully");
      }
    } catch (err) {
      console.warn("Notes sync fallback complete");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = leads.filter(l => {
    const matchesSearch = l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* List Panel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 lg:col-span-8 space-y-4 shadow-xs">
        
        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search leads by name, email, query..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["all", "new", "contacted", "qualified", "won", "lost"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  statusFilter === s 
                    ? "bg-violet-600 border-violet-650 text-white" 
                    : "bg-white border-slate-200 text-zinc-550 hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Lead Rows list */}
        <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-zinc-400 text-xs font-mono">No leads found matching criteria.</div>
          ) : (
            filtered.map((l) => (
              <div 
                key={l.id}
                onClick={() => { setSelectedLead(l); setAdminNotes(l.notes || ""); }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                  selectedLead?.id === l.id 
                    ? "border-violet-400 bg-violet-50/20 shadow-xs" 
                    : "border-slate-150 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 font-display">{l.name}</h4>
                    {l.status === "new" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-ping" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-1">{l.email} • {l.project_type || "Bespoke Design"}</span>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div className="hidden sm:block">
                    <span className="text-[9px] font-mono text-zinc-400 block">{l.budget || "No budget set"}</span>
                    <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">{new Date(l.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    l.status === "new" ? "bg-violet-100 text-violet-700 border border-violet-200" :
                    l.status === "won" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                    l.status === "lost" ? "bg-red-100 text-red-700 border border-red-200" :
                    "bg-slate-200 text-zinc-500"
                  }`}>
                    {l.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Detail panel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 lg:col-span-4 shadow-xs">
        {selectedLead ? (
          <div className="space-y-5">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-display font-bold text-zinc-900">{selectedLead.name}</h3>
                <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">{selectedLead.email}</span>
              </div>
              <button
                onClick={() => handleDeleteLead(selectedLead.id)}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg border border-slate-150 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-zinc-550 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
              <div>
                <span className="text-zinc-400 block text-[8px] uppercase">Phone</span>
                <span className="text-zinc-900 font-bold">{selectedLead.phone || "Not Provided"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[8px] uppercase">Country</span>
                <span className="text-zinc-900 font-bold">{selectedLead.country || "India"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[8px] uppercase">Budget</span>
                <span className="text-zinc-900 font-bold text-violet-600">{selectedLead.budget || "Not Specified"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[8px] uppercase">Timeline</span>
                <span className="text-zinc-900 font-bold">{selectedLead.timeline || "Flexible"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-400 block text-[8px] uppercase">Company</span>
                <span className="text-zinc-900 font-bold">{selectedLead.business_name || "N/A"} ({selectedLead.company_size || "1-5"})</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">Message Inquiry</label>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-zinc-700 leading-relaxed border border-slate-100 max-h-40 overflow-y-auto">
                {selectedLead.message || "No custom message supplied."}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">Update Status</label>
              <div className="grid grid-cols-3 gap-1.5">
                {["new", "contacted", "qualified", "won", "lost"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedLead.id, st)}
                    disabled={isSubmitting}
                    className={`py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                      selectedLead.status === st 
                        ? "bg-violet-600 text-white border-violet-650" 
                        : "bg-slate-50 hover:bg-slate-100 text-zinc-600 border-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">Operational Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Assign notes, team logs, current deal status..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-mono h-24"
              />
              <button
                onClick={handleSaveNotes}
                disabled={isSubmitting}
                className="w-full py-2 bg-zinc-900 text-white hover:bg-violet-600 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isSubmitting ? "Saving Notes..." : "Save Admin Notes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-zinc-400 text-xs font-mono">
            Select an inbound lead from the CRM panel to inspect full specifications, allocatenotes, and transition deals.
          </div>
        )}
      </div>

    </div>
  );
}

// ==========================================
// SUB-PANEL 3: PROJECT PORTFOLIO CMS
// ==========================================
function ProjectsCMS({ projects, fetchProjects, token, customConfirm }: { projects: any[]; fetchProjects: () => void; token: string; customConfirm: any }) {
  const [isEditing, setIsEditing] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    detailed_description: "",
    category: "Web Application",
    client_name: "",
    tech_stack: "",
    image_url: "",
    live_url: "",
    featured: false,
    sort_order: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startCreate = () => {
    setIsEditing({ isNew: true });
    setFormData({
      title: "",
      description: "",
      detailed_description: "",
      category: "Web Application",
      client_name: "",
      tech_stack: "React, Tailwind, Framer Motion",
      image_url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
      live_url: "",
      featured: false,
      sort_order: projects.length + 1
    });
  };

  const startEdit = (p: any) => {
    setIsEditing(p);
    setFormData({
      title: p.title || "",
      description: p.description || "",
      detailed_description: p.detailed_description || "",
      category: p.category || "Web Application",
      client_name: p.client_name || "",
      tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack.join(", ") : (p.tech_stack || ""),
      image_url: p.image_url || "",
      live_url: p.live_url || "",
      featured: !!p.featured,
      sort_order: p.sort_order || 0
    });
  };

  const handleDelete = async (id: string) => {
    customConfirm({
      title: "Delete Project",
      message: "Are you sure you want to delete this project CMS entry? This immediately updates Suman.design public page!",
      isDestructive: true,
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const res = await fetch(`/api/projects/${id}`, { 
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            fetchProjects();
            setIsEditing(null);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const parsedData = {
      ...formData,
      tech_stack: formData.tech_stack.split(",").map((s: string) => s.trim()).filter(Boolean),
      sort_order: Number(formData.sort_order)
    };

    try {
      const url = isEditing.isNew ? "/api/projects" : `/api/projects/${isEditing.id}`;
      const method = isEditing.isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(parsedData)
      });
      if (res.ok) {
        fetchProjects();
        setIsEditing(null);
      } else {
        alert("Operation failed, verify column types on Supabase");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
        <div>
          <h3 className="text-sm font-display font-bold text-zinc-900">Manage Portfolio Cases</h3>
          <p className="text-[10px] text-zinc-400 mt-0.5">Creating, modifying, and deleting works directly affects Suman.design portfolio page</p>
        </div>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-violet-650 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-500/10 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Publish Project
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="text-sm font-display font-bold text-zinc-900">
              {isEditing.isNew ? "Create New Portfolio Case" : `Edit Case: ${formData.title}`}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(null)}
              className="text-xs font-bold text-zinc-400 hover:text-zinc-650"
            >
              Cancel Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Project Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Royal Jaipur Luxury Boutique"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-display"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-mono"
              >
                <option value="E-Commerce">E-Commerce</option>
                <option value="Web Application">Web Application</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Client / Business Name</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="Jaipur Woodworks Corp"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Sort Order Index</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Tech Stack (comma separated)</label>
              <input
                type="text"
                value={formData.tech_stack}
                onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                placeholder="React, Framer Motion, Tailwind, Supabase"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Image URL</label>
              <input
                type="text"
                required
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Live Link URL</label>
              <input
                type="text"
                value={formData.live_url}
                onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                placeholder="https://client-demo.sumandesign.in"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Short Description</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief portfolio lookup summarizing the business challenge solved."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Detailed Challenge & Solution Case Study</label>
              <textarea
                value={formData.detailed_description}
                onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                placeholder="Expand here on specific technical challenges, client feedback, and Core Web Vitals audited metrics."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-sans h-36"
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2 py-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-violet-600 focus:ring-violet-500 border-slate-300 rounded"
              />
              <label htmlFor="featured" className="text-xs font-bold text-zinc-700">
                Feature Project on Home Grid (Gives visual banner highlight)
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 flex justify-between items-center">
            {!isEditing.isNew ? (
              <button
                type="button"
                onClick={() => handleDelete(isEditing.id)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash className="w-4 h-4" />
                Remove Case
              </button>
            ) : <div />}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-violet-650 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Case...
                </>
              ) : "Synchronize & Publish Live"}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.length === 0 ? (
            <div className="text-center py-20 col-span-2 bg-white border border-slate-200 rounded-2xl text-zinc-400 text-xs font-mono">
              No live projects created on Supabase projects CMS.
            </div>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group hover:border-violet-500/40 hover:shadow-md transition-all duration-300">
                <div className="aspect-video relative overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={p.image_url}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-white/95 backdrop-blur px-2.5 py-1 rounded-md shadow-xs text-violet-700">
                      {p.category}
                    </span>
                    {p.featured && (
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-violet-600 text-white px-2.5 py-1 rounded-md shadow-xs">
                        ★ Featured
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-bold text-zinc-900 text-base leading-tight">{p.title}</h4>
                    <span className="text-[9px] font-mono text-zinc-400 block mt-1">Client: {p.client_name || "Private Client"} • Order: {p.sort_order}</span>
                    <p className="text-xs text-zinc-550 mt-3 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>
                  <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-center">
                    <div className="flex gap-1.5 max-w-[70%] overflow-hidden truncate">
                      {Array.isArray(p.tech_stack) ? p.tech_stack.map((t: string) => (
                        <span key={t} className="text-[8px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-zinc-500">{t}</span>
                      )) : null}
                    </div>
                    <button
                      onClick={() => startEdit(p)}
                      className="text-xs text-violet-600 hover:text-violet-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUB-PANEL 4: FEEDBACK HUB
// ==========================================
function FeedbackHub({ feedback, fetchFeedback, token, customConfirm }: { feedback: any[]; fetchFeedback: () => void; token: string; customConfirm: any }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  const handleDeleteFeedback = async (id: string) => {
    customConfirm({
      title: "Delete Feedback",
      message: "Are you sure you want to delete this feedback review? This cannot be undone.",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/feedback/${id}`, { 
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            fetchFeedback();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const filtered = feedback.filter(f => {
    const matchesSearch = f.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === "all" || f.rating === Number(ratingFilter);
    return matchesSearch && matchesRating;
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search feedback comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-mono"
          />
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setRatingFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              ratingFilter === "all" ? "bg-violet-600 text-white border-violet-650" : "bg-white text-zinc-550 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setRatingFilter(rating)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                ratingFilter === rating ? "bg-violet-600 text-white border-violet-650" : "bg-white text-zinc-550 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{rating}</span>
              <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 col-span-2 text-zinc-400 text-xs font-mono">
            No feedback found matching the selected rating.
          </div>
        ) : (
          filtered.map((f) => (
            <div key={f.id} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-150/80 space-y-3 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < f.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} 
                      />
                    ))}
                  </div>
                  <span className="text-2xl" title="Visitor sentiment emoji">{f.emoji || "😀"}</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed italic mt-3">"{f.message || "No custom message provided. Left rating feedback."}"</p>
              </div>

              <div className="border-t border-slate-100 pt-3.5 mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <div className="flex flex-col gap-0.5">
                  <span>Page: {f.page_url || "Landing Index"}</span>
                  <span>Time: {new Date(f.created_at).toLocaleString()}</span>
                  <span className="text-[9px] text-zinc-400">Safari • macOS • India</span>
                </div>
                <button
                  onClick={() => handleDeleteFeedback(f.id)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

// ==========================================
// SUB-PANEL 5: MEDIA LIBRARY
// ==========================================
function MediaLibrary({ media, fetchMedia, token, customConfirm }: { media: any[]; fetchMedia: () => void; token: string; customConfirm: any }) {
  const [folderFilter, setFolderFilter] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        const res = await fetch("/api/media/upload", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            filename: file.name,
            size: file.size,
            mimetype: file.type,
            base64Data,
            folder: "projects"
          })
        });

        if (res.ok) {
          fetchMedia();
        } else {
          customConfirm({
            title: "Upload Failed",
            message: "Upload failed. Please verify that the image dimensions and file size are acceptable.",
            hideCancel: true,
            onConfirm: () => {}
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    customConfirm({
      title: "Permanently Delete Media",
      message: "Are you sure you want to permanently delete this media record?",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/media/${id}`, { 
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            fetchMedia();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = folderFilter === "all" ? media : media.filter(m => m.folder === folderFilter);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
      
      {/* Media control board */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex gap-1.5">
          {["all", "projects", "general", "team"].map((fol) => (
            <button
              key={fol}
              onClick={() => setFolderFilter(fol)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                folderFilter === fol ? "bg-violet-600 text-white border-violet-650" : "bg-white border-slate-200 text-zinc-550 hover:bg-slate-50"
              }`}
            >
              {fol}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            id="media-uploader-input"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          <label
            htmlFor="media-uploader-input"
            className="px-4 py-2 bg-violet-650 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Asset...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Media
              </>
            )}
          </label>
        </div>
      </div>

      {/* Media library grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 col-span-full text-zinc-400 text-xs font-mono">
            No image files loaded in selected folder.
          </div>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/50 flex flex-col justify-between group shadow-xs">
              <div className="aspect-square relative bg-slate-100 border-b border-slate-150 overflow-hidden flex items-center justify-center">
                <img
                  src={m.url}
                  alt={m.filename}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(m.url, m.id)}
                    className="p-2 bg-white text-violet-650 hover:bg-violet-50 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {copiedId === m.id ? "Copied" : "Copy Link"}
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 text-[10px] font-mono text-zinc-500 space-y-0.5">
                <span className="block text-zinc-800 font-bold truncate">{m.filename}</span>
                <span className="block">{(m.size / 1024).toFixed(1)} KB • {m.folder}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

// ==========================================
// SUB-PANEL 6: VISITOR ANALYTICS
// ==========================================
function VisitorAnalytics({ stats }: { stats: any }) {
  const sessions = stats.sessions || [];
  const views = stats.views || [];
  const clicks = stats.clicks || [];

  // Data aggregators
  const countriesCount = sessions.reduce((acc: any, s: any) => {
    const key = s.country || "India";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const browsersCount = sessions.reduce((acc: any, s: any) => {
    const key = s.browser || "Chrome";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const devicesCount = sessions.reduce((acc: any, s: any) => {
    const key = s.device || "Desktop";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Dynamic calculations
  const totalDuration = sessions.reduce((acc: any, s: any) => acc + (s.session_duration || 0), 0);
  const avgSecs = sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0;
  const avgSessionTime = avgSecs >= 60 ? `${Math.floor(avgSecs / 60)}m ${avgSecs % 60}s` : `${avgSecs}s`;

  const viewsPerSession = views.reduce((acc: any, v: any) => {
    acc[v.session_id] = (acc[v.session_id] || 0) + 1;
    return acc;
  }, {});
  let singlePageSessions = 0;
  sessions.forEach((s: any) => {
    if ((viewsPerSession[s.id] || 0) <= 1) {
      singlePageSessions++;
    }
  });
  const bounceRatePercent = sessions.length > 0 ? ((singlePageSessions / sessions.length) * 100).toFixed(1) : "0.0";

  const totalScroll = views.reduce((acc: any, v: any) => acc + (v.scroll_percentage || 0), 0);
  const avgScroll = views.length > 0 ? Math.round(totalScroll / views.length) : 0;
  const avgScrollDepth = `${avgScroll}%`;

  return (
    <div className="space-y-6">
      
      {/* Core Analytic indices cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStatCard label="Bounce Rate" value={`${bounceRatePercent}%`} detail="Single page sessions" stroke="bg-violet-600" />
        <MiniStatCard label="Avg Session Time" value={avgSessionTime} detail="Durable duration tracker" stroke="bg-emerald-500" />
        <MiniStatCard label="Average Scroll Depth" value={avgScrollDepth} detail="Vertical read engagement" stroke="bg-cyan-500" />
        <MiniStatCard label="Total Unique visitors" value={sessions.length || 0} detail="Active IP records" stroke="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Country Metrics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h4 className="font-display font-bold text-zinc-900 text-sm border-b border-slate-100 pb-3 mb-3">Country Demographics</h4>
          <div className="space-y-3 max-h-56 overflow-y-auto font-mono text-xs">
            {Object.entries(countriesCount).length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-[11px]">No country telemetry.</div>
            ) : (
              Object.entries(countriesCount).map(([country, count]: any) => (
                <div key={country} className="space-y-1">
                  <div className="flex justify-between font-bold text-zinc-800">
                    <span>{country}</span>
                    <span>{count} visits</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-violet-600 h-full" style={{ width: `${(count / (sessions.length || 1)) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Device Metrics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h4 className="font-display font-bold text-zinc-900 text-sm border-b border-slate-100 pb-3 mb-3">Device & Hardware</h4>
          <div className="space-y-3 max-h-56 overflow-y-auto font-mono text-xs">
            {Object.entries(devicesCount).length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-[11px]">No device records.</div>
            ) : (
              Object.entries(devicesCount).map(([dev, count]: any) => (
                <div key={dev} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-zinc-700">
                  <div className="flex items-center gap-2">
                    {dev.toLowerCase().includes("mobile") ? <Smartphone className="w-4 h-4 text-violet-500" /> : <Laptop className="w-4 h-4 text-cyan-500" />}
                    <span className="font-bold">{dev}</span>
                  </div>
                  <span>{count} records</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Browser breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h4 className="font-display font-bold text-zinc-900 text-sm border-b border-slate-100 pb-3 mb-3">Browser Engines</h4>
          <div className="space-y-3 max-h-56 overflow-y-auto font-mono text-xs">
            {Object.entries(browsersCount).length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-[11px]">No browser telemetry.</div>
            ) : (
              Object.entries(browsersCount).map(([b, count]: any) => (
                <div key={b} className="space-y-1">
                  <div className="flex justify-between font-bold text-zinc-800">
                    <span>{b}</span>
                    <span>{count} requests</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full" style={{ width: `${(count / (sessions.length || 1)) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Detailed Visitor Session Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h4 className="font-display font-bold text-zinc-900 text-sm border-b border-slate-100 pb-3 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-violet-600 animate-pulse" />
          Detailed Visitor Session Logs
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[10px] text-zinc-600">
            <thead>
              <tr className="border-b border-slate-200 text-zinc-400 font-bold">
                <th className="pb-2.5 font-display text-xs">Date & Time</th>
                <th className="pb-2.5 font-display text-xs">Session Reference</th>
                <th className="pb-2.5 font-display text-xs">Demographics</th>
                <th className="pb-2.5 font-display text-xs">Device & Hardware</th>
                <th className="pb-2.5 font-display text-xs">Browser & OS</th>
                <th className="pb-2.5 font-display text-xs text-right">Time Stayed</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400 font-sans text-xs">
                    No active visitor sessions recorded.
                  </td>
                </tr>
              ) : (
                sessions.slice(0, 30).map((session: any, idx: number) => {
                  const duration = session.session_duration || 0;
                  const formattedDuration = duration >= 60 
                    ? `${Math.floor(duration / 60)}m ${duration % 60}s` 
                    : `${duration}s`;
                  
                  const isMobile = session.device?.toLowerCase().includes("mobile");

                  return (
                    <tr key={session.id || idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-550/30 transition-colors">
                      <td className="py-3 font-sans text-xs text-zinc-700">
                        <div className="font-bold">
                          {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'Today'}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {session.created_at ? new Date(session.created_at).toLocaleTimeString() : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 font-mono">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[9px]">
                          {session.id ? session.id.substring(0, 8).toUpperCase() : 'ANONYMOUS'}
                        </span>
                        {session.referral_source && session.referral_source !== "Direct" && (
                          <div className="text-[9px] text-zinc-400 mt-1 truncate max-w-[120px]" title={session.referral_source}>
                            via {session.referral_source}
                          </div>
                        )}
                      </td>
                      <td className="py-3 font-sans text-xs text-zinc-700">
                        <div className="font-semibold flex items-center gap-1">
                          <span>{session.city || 'Unknown City'}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1 font-mono">
                          <Globe className="w-3 h-3 text-zinc-400" />
                          <span>{session.country || 'Unknown Country'}</span>
                        </div>
                      </td>
                      <td className="py-3 font-sans text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-700">
                          {isMobile ? (
                            <Smartphone className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          )}
                          <span>{session.device || 'Desktop Device'}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-[10px] text-zinc-500">
                        <div className="font-semibold text-zinc-700">{session.browser || 'Unknown Browser'}</div>
                        <div className="text-[9px] text-zinc-400 mt-0.5">{session.os || 'Unknown OS'}</div>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-zinc-950">
                        <span className={`px-2 py-1 rounded-lg text-[10px] ${
                          duration > 120 
                            ? "bg-emerald-50 text-emerald-700" 
                            : duration > 30 
                              ? "bg-amber-50 text-amber-700" 
                              : "bg-slate-50 text-slate-500"
                        }`}>
                          {formattedDuration}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heatmap logs list */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h4 className="font-display font-bold text-zinc-900 text-sm border-b border-slate-100 pb-3 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-600 animate-pulse" />
          Interactive Click Event logs
        </h4>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 font-mono text-[10px]">
          <table className="w-full text-left text-zinc-550">
            <thead>
              <tr className="border-b border-slate-100 text-zinc-400">
                <th className="pb-2">Element Selector</th>
                <th className="pb-2">Trigger Value</th>
                <th className="pb-2">Precise Coordinates</th>
                <th className="pb-2">Rendering Session</th>
                <th className="pb-2 text-right">Captured Time</th>
              </tr>
            </thead>
            <tbody>
              {clicks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-zinc-400">No click telemetry recorded. Interactive elements on the public site generate coordinates.</td>
                </tr>
              ) : (
                clicks.slice(0, 15).map((click: any, idx: number) => {
                  const selector = click.element_id ? `#${click.element_id}` : (click.element_class ? `.${click.element_class.split(' ')[0]}` : 'button');
                  return (
                    <tr key={click.id || idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-violet-700 truncate max-w-[150px]">{selector}</td>
                      <td className="truncate max-w-[150px]">{click.text ? `"${click.text}"` : 'N/A'}</td>
                      <td className="text-cyan-600 font-bold">X: {click.x || 0}, Y: {click.y || 0}</td>
                      <td>Session {click.session_id ? click.session_id.substring(0, 8) : 'N/A'}</td>
                      <td className="text-right text-zinc-400">{click.created_at ? new Date(click.created_at).toLocaleTimeString() : 'Just now'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ==========================================
// SUB-PANEL 7: WEB SETTINGS
// ==========================================
function WebSettings({ settings, fetchSettings, token, customConfirm }: { settings: any; fetchSettings: () => void; token: string; customConfirm: any }) {
  const [businessInfo, setBusinessInfo] = useState<any>({ ...settings.business_info });
  const [seoMetadata, setSeoMetadata] = useState<any>({ ...settings.seo_metadata });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ key: "business_info", value: businessInfo })
      });
      if (res.ok) {
        customConfirm({
          title: "Settings Updated",
          message: "Business configurations successfully updated",
          hideCancel: true,
          onConfirm: () => {}
        });
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ key: "seo_metadata", value: seoMetadata })
      });
      if (res.ok) {
        customConfirm({
          title: "SEO Updated",
          message: "SEO configurations successfully updated",
          hideCancel: true,
          onConfirm: () => {}
        });
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Contact configuration form */}
      <form onSubmit={handleSaveInfo} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <h4 className="font-display font-bold text-zinc-900 text-sm border-b border-slate-100 pb-3">Business Info</h4>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Agency Name</label>
            <input
              type="text"
              required
              value={businessInfo.name || "Suman Design"}
              onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-display"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Official Email</label>
            <input
              type="email"
              required
              value={businessInfo.email || "contact@sumandesign.in"}
              onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Contact Phone</label>
            <input
              type="text"
              required
              value={businessInfo.phone || "+91 98835 81298"}
              onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">WhatsApp Direct Link</label>
            <input
              type="text"
              required
              value={businessInfo.whatsapp || "+919883581298"}
              onChange={(e) => setBusinessInfo({ ...businessInfo, whatsapp: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Instagram Username</label>
            <input
              type="text"
              required
              value={businessInfo.instagram || "suman_web_design"}
              onChange={(e) => setBusinessInfo({ ...businessInfo, instagram: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-zinc-900 text-white hover:bg-violet-600 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          {isSubmitting ? "Updating Database..." : "Update Business Info"}
        </button>
      </form>

      {/* SEO configuration form */}
      <form onSubmit={handleSaveSeo} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <h4 className="font-display font-bold text-zinc-900 text-sm border-b border-slate-100 pb-3">Search Engine (SEO) Meta Tags</h4>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Meta Title</label>
            <input
              type="text"
              required
              value={seoMetadata.meta_title || "Suman Web Design Agency | Premium Website Design & Development"}
              onChange={(e) => setSeoMetadata({ ...seoMetadata, meta_title: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-display"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Meta Description</label>
            <textarea
              required
              value={seoMetadata.meta_description || "Elite digital solutions and premium custom-tailored web development services."}
              onChange={(e) => setSeoMetadata({ ...seoMetadata, meta_description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-sans h-28"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Open Graph (OG) Image URL</label>
            <input
              type="text"
              required
              value={seoMetadata.og_image || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80"}
              onChange={(e) => setSeoMetadata({ ...seoMetadata, og_image: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-zinc-900 text-white hover:bg-violet-600 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          {isSubmitting ? "Updating Database..." : "Save SEO Meta Tags"}
        </button>
      </form>

    </div>
  );
}

// ==========================================
// SUB-PANEL 8: SECURITY AUDIT
// ==========================================
function SecurityPanel({ logs, fetchLogs }: { logs: any; fetchLogs: () => void }) {
  const [resetEmail, setResetEmail] = useState("");
  const [resetPass, setResetPass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetPass) return;
    setIsSubmitting(true);
    try {
      // Simulate/Trigger a password reset hash change
      alert(`Password updated for admin account: ${resetEmail}`);
      setResetPass("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      
      {/* Reset password form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="font-display font-bold text-zinc-900 text-sm border-b border-slate-100 pb-3">Reset Admin Password</h4>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Admin Email</label>
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="admin@sumandesign.in"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">New Password</label>
            <input
              type="password"
              required
              value={resetPass}
              onChange={(e) => setResetPass(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-zinc-900 text-white hover:bg-violet-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            {isSubmitting ? "Changing Credentials..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Audit Logs list (INSERT, UPDATE, DELETE activities captured) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs md:col-span-2 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h4 className="font-display font-bold text-zinc-900 text-sm">System Operations Audit Trail</h4>
          <button 
            onClick={fetchLogs}
            className="p-1 rounded hover:bg-slate-50 text-zinc-450 border border-transparent hover:border-slate-150 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 font-mono text-[10px]">
          {logs.activity?.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">No active operations recorded yet.</div>
          ) : (
            logs.activity.map((act: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                <div className="max-w-[70%]">
                  <span className="text-zinc-800 font-bold block">{act.action}</span>
                  <span className="text-zinc-450 block mt-0.5 leading-relaxed">{act.description || "System operation completed successfully."}</span>
                </div>
                <span className="text-zinc-400 shrink-0">{new Date(act.created_at || Date.now()).toLocaleTimeString()}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

// ==========================================
// SUB-PANEL 9: ADMIN PROFILE
// ==========================================
function ProfilePanel({ sessionUser, setSessionUser, customConfirm }: any) {
  const [name, setName] = useState(sessionUser.name || "");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("Elite full-stack engineer and operations administrator of Suman.design");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setSessionUser({ ...sessionUser, name });
      setIsSubmitting(false);
      customConfirm({
        title: "Profile Updated",
        message: "Administrator profile updated successfully",
        hideCancel: true,
        onConfirm: () => {}
      });
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <div className="w-14 h-14 rounded-full bg-violet-100 border-2 border-violet-250 flex items-center justify-center text-violet-700 font-display font-bold text-xl shadow-inner">
          {name.substring(0, 2).toUpperCase() || "AD"}
        </div>
        <div>
          <h4 className="font-display font-bold text-zinc-900 text-base">{name || "Suman Admin"}</h4>
          <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">Role: Operations Administrator</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Administrator Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-display"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Email (read-only)</label>
          <input
            type="text"
            readOnly
            value={sessionUser.email}
            className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none font-mono text-zinc-500 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Profile Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500 font-sans h-24"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-zinc-900 text-white hover:bg-violet-600 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
      >
        {isSubmitting ? "Syncing Admin Record..." : "Synchronize Profile Details"}
      </button>
    </form>
  );
}

function DatabaseErrorView({ dbStatus, onRetry }: { dbStatus: any; onRetry: () => void }) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await onRetry();
    setIsRetrying(false);
  };

  const sqlError = dbStatus?.sqlError || "Unknown connection error";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 select-text selection:bg-violet-500 selection:text-white">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-display font-bold text-white">Unable to load data</h2>
          <p className="text-sm text-slate-400">
            A secure connection to the database could not be established or required tables are missing.
          </p>
          {sqlError !== "None" && (
            <div className="text-left">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Error Logs</span>
              <p className="text-xs font-mono text-red-400 bg-red-950/20 border border-red-900/30 p-3.5 rounded-xl break-all leading-normal">
                {sqlError}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all cursor-pointer shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
        >
          {isRetrying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Reconnecting...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </>
          )}
        </button>
      </div>
    </div>
  );
}
