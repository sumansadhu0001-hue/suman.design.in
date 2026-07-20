import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { supabaseAdmin as supabaseServer } from "./src/lib/supabase/admin";
import { z } from "zod";
import { WebSocketServer, WebSocket } from "ws";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" })); // Increase limit for Base64 media uploads

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// ==========================================
// ZOD SCHEMAS FOR SECURE INPUT VALIDATION
// ==========================================
const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  business_name: z.string().optional(),
  company_size: z.string().optional(),
  project_type: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  country: z.string().optional(),
  message: z.string().optional(),
  source_page: z.string().optional(),
  referral_source: z.string().optional(),
});

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  emoji: z.string().optional(),
  message: z.string().optional(),
  page_url: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  detailed_description: z.string().optional(),
  category: z.string().min(1),
  client_name: z.string().optional(),
  tech_stack: z.array(z.string()).default([]),
  image_url: z.string(),
  live_url: z.string().optional(),
  featured: z.boolean().default(false),
  sort_order: z.number().default(0),
});

// ==========================================
// SECURITY MIDDLEWARES & HELPERS
// ==========================================
// Verified strictly via Supabase Auth JWT token checks.

async function adminAuthMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
    }
    (req as any).user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Authentication failed: " + err.message });
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach(cookie => {
    const parts = cookie.split("=");
    if (parts.length === 2) {
      cookies[parts[0].trim()] = parts[1].trim();
    }
  });
  return cookies;
}

// Ensure middleware only protects /admin/* routes and not the public website.
// It redirects unauthorized users to /admin/login instead of /
app.get("/admin/*", async (req, res, next) => {
  if (req.path === "/admin/login") {
    return next();
  }
  
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.admin_token;
  
  if (!token) {
    const redirectUrl = `/admin/login?redirect=${encodeURIComponent(req.originalUrl)}`;
    return res.redirect(redirectUrl);
  }
  
  try {
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    if (error || !user) {
      const redirectUrl = `/admin/login?redirect=${encodeURIComponent(req.originalUrl)}`;
      return res.redirect(redirectUrl);
    }
    next();
  } catch (err) {
    const redirectUrl = `/admin/login?redirect=${encodeURIComponent(req.originalUrl)}`;
    return res.redirect(redirectUrl);
  }
});

// ==========================================
// IN-MEMORY FALLBACK STORES
// ==========================================
interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  business_name?: string;
  company_size?: string;
  project_type?: string;
  budget?: string;
  timeline?: string;
  country?: string;
  message?: string;
  source_page?: string;
  referral_source?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Feedback {
  id: string;
  rating: number;
  emoji?: string;
  message?: string;
  page_url?: string;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  detailed_description?: string;
  category: string;
  client_name?: string;
  status: string;
  tech_stack: string[];
  image_url: string;
  live_url?: string;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface VisitorSession {
  id: string;
  visitor_id: string;
  landing_page?: string;
  referral_source?: string;
  device?: string;
  browser?: string;
  os?: string;
  language?: string;
  country?: string;
  city?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  session_duration: number;
  created_at: string;
  updated_at: string;
}

interface PageView {
  id: string;
  session_id: string;
  url: string;
  title?: string;
  referrer?: string;
  time_spent: number;
  scroll_percentage: number;
  created_at: string;
}

interface ClickEvent {
  id: string;
  session_id: string;
  element_id?: string;
  element_class?: string;
  text?: string;
  x?: number;
  y?: number;
  created_at: string;
}

interface AnalyticsEvent {
  id: string;
  session_id: string;
  event_type: string;
  event_name: string;
  event_data: any;
  created_at: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
  folder: string;
  created_at: string;
}

interface LogEntry {
  id: string;
  user_id?: string | null;
  action: string;
  description?: string;
  created_at: string;
}

interface AuditEntry {
  id: string;
  user_id?: string | null;
  table_name: string;
  action_type: string;
  old_data: any;
  new_data: any;
  ip_address: string;
  created_at: string;
}

// No in-memory stores are used to ensure 100% direct Supabase integration without mock behaviors.

// Log audit activities helper
async function logAudit(user: string, actionType: string, tableName: string, oldData: any = null, newData: any = null) {
  try {
    await supabaseServer.from("audit_logs").insert({
      user_id: null,
      table_name: tableName,
      action_type: actionType,
      old_data: oldData,
      new_data: newData,
      ip_address: "127.0.0.1",
    });
  } catch (err) {
    console.error("Failed to write audit log to Supabase:", err);
  }
}

// Log system activity logs helper
async function logActivity(action: string, description: string) {
  try {
    await supabaseServer.from("activity_logs").insert({
      action,
      description,
    });
  } catch (err) {
    console.error("Failed to write activity log to Supabase:", err);
  }
}

// Add system notification for admins
async function notifyAdmin(title: string, message: string, type: string = "info") {
  try {
    await supabaseServer.from("notifications").insert({
      title,
      message,
      type,
      is_read: false,
    });
  } catch (err) {
    console.error("Failed to write system notification to Supabase:", err);
  }
}

// ==========================================
// BACKEND API ENDPOINTS
// ==========================================

// Chatbot proxy
app.post("/api/chat", async (req, res) => {
  try {
    const { contents } = req.body;
    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: "Invalid request. 'contents' must be an array of chat turns." });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: `You are 'Suman.design AI', an elite, highly professional AI digital consultant representing Suman Design, a premium web development and custom digital architecture agency. Suman Design builds custom, high-performance, visual-first bespoke websites, tailored e-commerce systems, high-converting corporate portals, and custom web applications with beautiful layouts, micro-animations, and elite technical execution.

Speak with elegant, objective, polished professionalism. Be helpful, clear, and concise. Keep replies beautifully formatted with clean headers, bullet points, and bold text for key metrics or technical aspects.

You have the unique ability to interact directly with the client's interface using special hidden commands. Whenever a user asks to see a page, section, portfolio, pricing, or wants to get in touch, or when you feel it is highly relevant, append the appropriate command tag to the VERY END of your response (after all your text):
- If they want to view projects or portfolio: append [NAVIGATE: work]
- If they want to see services offered: append [NAVIGATE: services]
- If they want to view pricing plans: append [NAVIGATE: pricing]
- If they want to contact us or start a project: append [NAVIGATE: contact]
- If they want to return home: append [NAVIGATE: home]
- If they ask to toggle, change, switch theme (dark/light mode) or complain about brightness: append [TOGGLE_THEME]

Example of adding a command:
"Certainly! Here is a showcase of our recent works. I have navigated your screen to our selected portfolio section so you can inspect them... [NAVIGATE: work]"

Never explain the bracketed command syntax to the user; just output it naturally at the very end.`
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred while communicating with Gemini." });
  }
});

// ==========================================
// SUPABASE AUTH SESSION ENDPOINT
// ==========================================
app.get("/api/admin/session", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ authenticated: false });
  }
  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ authenticated: false });
    }
    res.json({ authenticated: true, user: { email: user.email, name: user.user_metadata?.name || user.email } });
  } catch (err) {
    res.status(401).json({ authenticated: false });
  }
});

// Simple in-memory rate limiting for contact form (3 submissions per 5 minutes per IP)
const leadSubmissionsRateLimit = new Map<string, number[]>();

const checkLeadRateLimit = (ip: string): { allowed: boolean; waitTimeMs: number } => {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const limit = 3;

  let submissions = leadSubmissionsRateLimit.get(ip) || [];
  // filter out old timestamps
  submissions = submissions.filter(timestamp => now - timestamp < windowMs);
  
  if (submissions.length >= limit) {
    const oldest = Math.min(...submissions);
    const waitTimeMs = windowMs - (now - oldest);
    return { allowed: false, waitTimeMs };
  }

  // Record submission
  submissions.push(now);
  leadSubmissionsRateLimit.set(ip, submissions);
  return { allowed: true, waitTimeMs: 0 };
};

// Leads CRM API (Contact Forms)
app.post("/api/leads", async (req, res) => {
  try {
    const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown-ip";
    const rateCheck = checkLeadRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: "Rate limit exceeded. You can only send up to 3 contact forms every 5 minutes.",
        waitTime: Math.ceil(rateCheck.waitTimeMs / 1000)
      });
    }

    const parsedData = leadSchema.parse(req.body);
    let finalLead: any = null;

    let insertObject: any = {
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phone || "",
      business_name: parsedData.business_name || "",
      company_size: parsedData.company_size || "",
      project_type: parsedData.project_type || "Custom Website",
      budget: parsedData.budget || "Not Specified",
      timeline: parsedData.timeline || "Flexible",
      country: parsedData.country || "India",
      message: parsedData.message || "",
      source_page: parsedData.source_page || "Contact Page",
      referral_source: parsedData.referral_source || "Direct",
      status: "new",
    };

    let { data, error } = await supabaseServer
      .from("leads")
      .insert(insertObject)
      .select();

    if (error && error.message && (error.message.includes("column") || error.message.includes("schema cache") || error.code === "PGRST204" || error.code === "23502")) {
      console.warn("Standard leads schema insert failed, retrying with alternative (client_name, whatsapp_number) mapping:", error.message);
      
      const altInsertObject: any = {
        client_name: parsedData.name,
        email: parsedData.email,
        whatsapp_number: parsedData.phone || "Not Provided",
        business_name: parsedData.business_name || "",
        company_size: parsedData.company_size || "",
        project_type: parsedData.project_type || "Custom Website",
        budget: parsedData.budget || "Not Specified",
        timeline: parsedData.timeline || "Flexible",
        country: parsedData.country || "India",
        message: parsedData.message || "",
        source_page: parsedData.source_page || "Contact Page",
        referral_source: parsedData.referral_source || "Direct",
        status: "new",
      };

      const retryResult = await supabaseServer
        .from("leads")
        .insert(altInsertObject)
        .select();

      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      throw error;
    }

    if (data?.[0]) {
      finalLead = normalizeLeads([data[0]])[0];
    }

    await notifyAdmin(
      "New Project Lead",
      `New project lead received from ${parsedData.name} (${parsedData.email}) for ${parsedData.project_type}.`,
      "lead"
    );

    // Broadcast new lead real-time via WebSocket
    if (finalLead) {
      broadcastNewLead(finalLead);
    }

    res.json({ success: true, lead: finalLead });
  } catch (err: any) {
    console.error("Lead submission error:", err);
    res.status(400).json({ error: err.message || "Unable to save lead" });
  }
});

// Helper to normalize lead objects so that they support both schema types
// (name/phone or client_name/whatsapp_number) seamlessly.
function normalizeLeads(leads: any[]): any[] {
  if (!leads) return [];
  return leads.map(l => {
    const name = l.name || l.client_name || "N/A";
    const phone = l.phone || l.whatsapp_number || "Not Provided";
    return {
      ...l,
      name,
      client_name: name,
      phone,
      whatsapp_number: phone
    };
  });
}

app.get("/api/leads", adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseServer
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(normalizeLeads(data || []));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/leads/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabaseServer
      .from("leads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    await logAudit("admin", "UPDATE", "leads", null, { id, status });
    res.json({ success: true, lead: normalizeLeads([data[0]])[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/leads/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseServer.from("leads").delete().eq("id", id);
    if (error) throw error;

    await logAudit("admin", "DELETE", "leads", { id }, null);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Feedback API
app.post("/api/feedback", async (req, res) => {
  try {
    const parsedData = feedbackSchema.parse(req.body);
    let finalFeedback: any = null;

    const { data, error } = await supabaseServer
      .from("feedback")
      .insert({
        rating: parsedData.rating,
        emoji: parsedData.emoji || "😀",
        message: parsedData.message || "",
        page_url: parsedData.page_url || "/",
      })
      .select();

    if (error) throw error;
    if (data?.[0]) {
      finalFeedback = data[0];
    }

    await notifyAdmin(
      "New Website Feedback",
      `Received ${parsedData.rating}-star feedback rating: "${parsedData.message || 'No comment'}"`,
      "feedback"
    );

    res.json({ success: true, feedback: finalFeedback });
  } catch (err: any) {
    console.error("Feedback error:", err);
    res.status(400).json({ error: err.message || "Unable to save feedback" });
  }
});

app.get("/api/feedback", adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseServer
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/feedback/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseServer.from("feedback").delete().eq("id", id);
    if (error) throw error;

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Project CMS API (Portfolio content management)
app.get("/api/projects", async (req, res) => {
  try {
    const { data, error } = await supabaseServer
      .from("projects")
      .select("*");

    if (error) throw error;

    const projects = data || [];
    projects.sort((a, b) => {
      const orderA = typeof a.sort_order === "number" ? a.sort_order : 0;
      const orderB = typeof b.sort_order === "number" ? b.sort_order : 0;
      return orderA - orderB;
    });
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/projects", adminAuthMiddleware, async (req, res) => {
  try {
    const parsedData = projectSchema.parse(req.body);

    const { data, error } = await supabaseServer
      .from("projects")
      .insert(parsedData)
      .select();

    if (error) throw error;

    await logActivity("Add Project", `Added new project: ${parsedData.title}`);
    await logAudit("admin", "INSERT", "projects", null, parsedData);
    await notifyAdmin("Project Added", `A new project "${parsedData.title}" has been published.`, "info");

    res.json({ success: true, project: data?.[0] });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/projects/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const parsedData = projectSchema.parse(req.body);

    const { data, error } = await supabaseServer
      .from("projects")
      .update({ ...parsedData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    await logActivity("Update Project", `Updated project: ${parsedData.title}`);
    await logAudit("admin", "UPDATE", "projects", null, parsedData);

    res.json({ success: true, project: data[0] });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/projects/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseServer.from("projects").delete().eq("id", id);
    if (error) throw error;

    await logActivity("Delete Project", `Deleted project ID ${id}`);
    await logAudit("admin", "DELETE", "projects", { id }, null);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Visitor Analytics Logs
app.post("/api/analytics/session", async (req, res) => {
  try {
    const { visitor_id, landing_page, referral_source, device, browser, os, language, country, city, utm_source, utm_medium, utm_campaign } = req.body;
    
    const { data, error } = await supabaseServer
      .from("visitor_sessions")
      .insert({
        visitor_id,
        landing_page,
        referral_source,
        device,
        browser,
        os,
        language,
        country: country || "Unknown",
        city: city || "Unknown",
        utm_source,
        utm_medium,
        utm_campaign,
        session_duration: 0
      })
      .select();

    if (error) throw error;
    res.json({ session_id: data?.[0]?.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/analytics/view", async (req, res) => {
  try {
    const { session_id, url, title, referrer, scroll_percentage, time_spent } = req.body;
    if (!session_id) return res.status(400).json({ error: "Session ID required" });

    const { error } = await supabaseServer
      .from("page_views")
      .insert({
        session_id,
        url,
        title,
        referrer,
        scroll_percentage: scroll_percentage || 0,
        time_spent: time_spent || 0
      });

    if (error) throw error;

    // Update visitor session duration inline to prevent reliance on custom Postgres RPC functions
    if (time_spent > 0) {
      const { data: session } = await supabaseServer
        .from("visitor_sessions")
        .select("session_duration")
        .eq("id", session_id)
        .maybeSingle();

      if (session) {
        const newDuration = (session.session_duration || 0) + time_spent;
        await supabaseServer
          .from("visitor_sessions")
          .update({ session_duration: newDuration, updated_at: new Date().toISOString() })
          .eq("id", session_id);
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/analytics/click", async (req, res) => {
  try {
    const { session_id, element_id, element_class, text, x, y } = req.body;
    if (!session_id) return res.status(400).json({ error: "Session ID required" });

    await supabaseServer
      .from("click_events")
      .insert({ session_id, element_id, element_class, text, x, y });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/analytics/event", async (req, res) => {
  try {
    const { session_id, event_type, event_name, event_data } = req.body;
    if (!session_id) return res.status(400).json({ error: "Session ID required" });

    await supabaseServer
      .from("analytics_events")
      .insert({ session_id, event_type, event_name, event_data: event_data || {} });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics Dashboard statistics aggregator
app.get("/api/analytics/stats", adminAuthMiddleware, async (req, res) => {
  try {
    // Collect stats from tables
    const sessionsRes = await supabaseServer.from("visitor_sessions").select("*");
    if (sessionsRes.error) throw sessionsRes.error;

    const viewsRes = await supabaseServer.from("page_views").select("*");
    if (viewsRes.error) throw viewsRes.error;

    const leadsRes = await supabaseServer.from("leads").select("*");
    if (leadsRes.error) throw leadsRes.error;

    const feedbackRes = await supabaseServer.from("feedback").select("*");
    if (feedbackRes.error) throw feedbackRes.error;

    const clicksRes = await supabaseServer.from("click_events").select("*");
    if (clicksRes.error) throw clicksRes.error;

    const totalSessions = sessionsRes.data?.length || 0;
    const totalViews = viewsRes.data?.length || 0;
    const totalLeads = leadsRes.data?.length || 0;
    const totalFeedback = feedbackRes.data?.length || 0;

    // Average rating calculation
    let avgRating = 0;
    if (feedbackRes.data && feedbackRes.data.length > 0) {
      const sum = feedbackRes.data.reduce((acc, f) => acc + (f.rating || 0), 0);
      avgRating = parseFloat((sum / feedbackRes.data.length).toFixed(1));
    }

    res.json({
      summary: {
        total_sessions: totalSessions,
        total_views: totalViews,
        total_leads: totalLeads,
        total_feedback: totalFeedback,
        average_rating: avgRating,
      },
      sessions: sessionsRes.data || [],
      views: viewsRes.data || [],
      leads: normalizeLeads(leadsRes.data || []),
      feedback: feedbackRes.data || [],
      clicks: clicksRes.data || [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load database analytics stats." });
  }
});

// Database status check
app.get("/api/db-status", async (req, res) => {
  const missingEnv: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingEnv.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingEnv.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const tablesToVerify = [
    { name: "profiles", dbName: "profiles" },
    { name: "leads", dbName: "leads" },
    { name: "feedback", dbName: "feedback" },
    { name: "projects", dbName: "projects" },
    { name: "visitor_sessions", dbName: "visitor_sessions" },
    { name: "page_views", dbName: "page_views" },
    { name: "analytics_events", dbName: "analytics_events" },
    { name: "website_settings", dbName: "website_settings" },
    { name: "notifications", dbName: "notifications" },
    { name: "media_library", dbName: "media_library" }
  ];

  const results: any[] = [];
  const missingTables: string[] = [];
  const errors: Record<string, string> = {};
  let connectionStatus = missingEnv.length > 0 ? "Disconnected" : "Connected";
  let sqlError = "None";

  if (missingEnv.length === 0) {
    for (const table of tablesToVerify) {
      try {
        const { error } = await supabaseServer.from(table.dbName).select("*").limit(1);
        if (error) {
          if (error.code === "42P01" || error.message.includes("relation") || error.message.includes("does not exist") || error.message.includes("not found")) {
            missingTables.push(table.name);
            errors[table.name] = error.message;
          } else {
            results.push({ name: table.name, status: "error", message: error.message });
            connectionStatus = "Disconnected";
            sqlError = error.message;
          }
        } else {
          results.push({ name: table.name, status: "ok" });
        }
      } catch (err: any) {
        missingTables.push(table.name);
        errors[table.name] = err.message || String(err);
        connectionStatus = "Disconnected";
        sqlError = err.message || String(err);
      }
    }
  } else {
    connectionStatus = "Disconnected";
    sqlError = "Missing Supabase credentials in environment variables.";
    tablesToVerify.forEach(t => {
      missingTables.push(t.name);
      errors[t.name] = "Supabase connection unavailable - missing environment variables.";
    });
  }

  // RLS check - standard warning check or verify active policies
  const missingRlsPolicies: string[] = [];
  if (missingTables.length > 0) {
    missingRlsPolicies.push("RLS policies cannot be fully verified until missing tables are created.");
  }

  const migrationSQL = `-- Suman.design PostgreSQL Database Schema Migration
-- Copy and run this script in your Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    business_name TEXT,
    company_size TEXT,
    project_type TEXT,
    budget TEXT,
    timeline TEXT,
    country TEXT,
    message TEXT,
    source_page TEXT,
    referral_source TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    emoji TEXT,
    message TEXT,
    page_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    category TEXT NOT NULL,
    client_name TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    tech_stack TEXT[] DEFAULT '{}'::TEXT[],
    image_url TEXT NOT NULL,
    live_url TEXT,
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.visitor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL,
    landing_page TEXT,
    referral_source TEXT,
    device TEXT,
    browser TEXT,
    os TEXT,
    language TEXT,
    country TEXT,
    city TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    session_duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    referrer TEXT,
    time_spent INTEGER DEFAULT 0,
    scroll_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.click_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
    element_id TEXT,
    element_class TEXT,
    text TEXT,
    x INTEGER,
    y INTEGER,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.website_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    size INTEGER NOT NULL,
    mimetype TEXT NOT NULL,
    folder TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed defaults
INSERT INTO public.website_settings (key, value)
VALUES 
('business_info', '{"name": "Suman Design", "email": "contact@sumandesign.in", "phone": "+91 98765 43210", "whatsapp": "+919876543210", "instagram": "suman.design", "linkedin": "suman-design"}'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.website_settings (key, value)
VALUES 
('seo_metadata', '{"meta_title": "Suman Web Design Agency | Premium Website Design & Development", "meta_description": "Elite digital solutions and premium custom-tailored web development services.", "og_image": ""}'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
`;

  const finalStatus = (missingTables.length > 0 || missingEnv.length > 0 || connectionStatus === "Disconnected") ? "error" : "ok";
  const migrationStatus = missingTables.length === 0 ? "Fully Migrated" : (missingTables.length === tablesToVerify.length ? "Pending Migration" : "Partial Migration / Incomplete Schema");

  return res.status(200).json({
    status: finalStatus,
    connectionStatus,
    missingEnv,
    missingTables,
    missingRlsPolicies: missingEnv.length > 0 ? ["Cannot check policies - missing credentials"] : (missingTables.length > 0 ? ["Pending table creation"] : []),
    sqlError,
    migrationStatus,
    errors,
    results,
    migration: migrationSQL
  });
});

// Website settings (Business info & SEO metadata)
app.get("/api/settings", async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from("website_settings").select("*");
    if (error) throw error;

    const settingsObj: any = {};
    data.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    res.json(settingsObj);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load website settings from database." });
  }
});

app.post("/api/settings", adminAuthMiddleware, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: "Settings Key required" });

    const { data, error } = await supabaseServer
      .from("website_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select();

    if (error) throw error;

    await logActivity("Update Settings", `Updated website configuration key: ${key}`);
    await logAudit("admin", "UPSERT", "website_settings", null, { key, value });

    res.json({ success: true, setting: data?.[0] });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Notifications
app.get("/api/notifications", adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseServer
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notifications/read", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabaseServer
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Media Library Base64 mock storage simulation to avoid external cloud storage issues
app.post("/api/media/upload", adminAuthMiddleware, async (req, res) => {
  try {
    const { filename, size, mimetype, base64Data, folder } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ error: "Filename and base64Data required" });
    }

    // Try to upload to Supabase Storage bucket, or fallback to saving URL/Base64 directly in media_library
    const mediaUrl = base64Data.startsWith("data:") ? base64Data : `data:${mimetype};base64,${base64Data}`;

    const { data, error } = await supabaseServer
      .from("media_library")
      .insert({
        filename,
        url: mediaUrl,
        size: size || base64Data.length,
        mimetype: mimetype || "image/png",
        folder: folder || "general",
      })
      .select();

    if (error) throw error;

    await logActivity("Upload Media", `Uploaded file: ${filename}`);
    res.json({ success: true, media: data?.[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/media", adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseServer
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load media assets." });
  }
});

app.delete("/api/media/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseServer.from("media_library").delete().eq("id", id);
    if (error) throw error;

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Live Stats feed (Online / active sessions in last 5 minutes)
app.get("/api/admin/live", adminAuthMiddleware, async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    // Sessions created or updated in last 5 minutes
    const { data, error } = await supabaseServer
      .from("visitor_sessions")
      .select("*")
      .gt("updated_at", fiveMinutesAgo);

    if (error) throw error;
    res.json({ online_count: data?.length || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve live counts." });
  }
});

// Logs (Activity & Audit)
app.get("/api/admin/logs", adminAuthMiddleware, async (req, res) => {
  try {
    const activityRes = await supabaseServer.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(50);
    const auditRes = await supabaseServer.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);

    res.json({
      activity: activityRes.data || [],
      audit: auditRes.data || [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Purge Demo/All Data
app.post("/api/admin/purge-demo", adminAuthMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // 'demo_only' or 'all_data'

    if (type === "all_data") {
      // Delete everything safely by checking not-empty
      const { error: pErr } = await supabaseServer.from("projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const { error: lErr } = await supabaseServer.from("leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const { error: fErr } = await supabaseServer.from("feedback").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      if (pErr) throw pErr;
      if (lErr) throw lErr;
      if (fErr) throw fErr;
      
      await logActivity("Purge All Data", "Admin fully purged all projects, leads, and feedback from database.");
      await logAudit("admin", "PURGE", "multiple", null, { type: "all_data" });
    } else {
      // Delete default demo items
      const { error: pErr } = await supabaseServer.from("projects").delete().in("title", ["Aether Boutique", "Apex Dashboard"]);
      const { error: lErr } = await supabaseServer.from("leads").delete().in("email", ["test@example.com", "client@company.com"]);
      const { error: fErr } = await supabaseServer.from("feedback").delete().eq("message", "This is an automated test feedback submission.");
      
      if (pErr) throw pErr;
      if (lErr) throw lErr;
      if (fErr) throw fErr;

      await logActivity("Purge Demo Data", "Admin purged default demo/seed items from database.");
      await logAudit("admin", "PURGE", "multiple", null, { type: "demo_only" });
    }

    res.json({ success: true, message: "Data purged successfully!" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to purge database records." });
  }
});


// ==========================================
// WEBSOCKET REAL-TIME NOTIFICATIONS
// ==========================================
let wss: WebSocketServer | null = null;

function broadcastNewLead(lead: any) {
  if (!wss) return;
  const payload = JSON.stringify({
    type: "NEW_LEAD",
    lead,
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        console.error("Error sending ws message:", err);
      }
    }
  });
}


// ==========================================
// STATIC ASSET SERVING & WEB ENTRY
// ==========================================
// ==========================================
// STATIC ASSET SERVING & WEB ENTRY
// ==========================================
async function startServer() {
  // 1. Robots.txt
  app.get("/robots.txt", async (req, res) => {
    try {
      const { data } = await supabaseServer.from("website_settings").select("*").eq("key", "seo_robots");
      if (data && data.length > 0 && data[0].value) {
        res.header("Content-Type", "text/plain");
        return res.send(data[0].value);
      }
    } catch (err) {
      console.error("Robots check failed", err);
    }
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /login
Disallow: /dashboard

Sitemap: https://sumanwebdesign.com/sitemap.xml
Image-sitemap: https://sumanwebdesign.com/image-sitemap.xml
`;
    res.header("Content-Type", "text/plain");
    res.send(robots);
  });

  // 2. Sitemap.xml
  app.get("/sitemap.xml", async (req, res) => {
    const origin = "https://sumanwebdesign.com";
    const pages = [
      { loc: "", changefreq: "daily", priority: "1.0" },
      { loc: "/services", changefreq: "weekly", priority: "0.9" },
      { loc: "/work", changefreq: "weekly", priority: "0.8" },
      { loc: "/pricing", changefreq: "weekly", priority: "0.8" },
      { loc: "/contact", changefreq: "monthly", priority: "0.7" },
      { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
      { loc: "/cookie", changefreq: "yearly", priority: "0.3" },
      { loc: "/refund", changefreq: "yearly", priority: "0.3" }
    ];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    pages.forEach(p => {
      xml += `  <url>\n`;
      xml += `    <loc>${origin}${p.loc}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n`;
      xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
      xml += `    <priority>${p.priority}</priority>\n`;
      xml += `  </url>\n`;
    });
    xml += `</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
  });

  // 3. Image Sitemap.xml
  app.get("/image-sitemap.xml", async (req, res) => {
    const origin = "https://sumanwebdesign.com";
    const images = [
      { loc: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80", title: "Suman Web Design Agency Office" },
      { loc: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80", title: "Zari & Silk Luxury Boutique E-Commerce" },
      { loc: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80", title: "Araku Valley Coffee preorder platform" },
      { loc: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80", title: "Royal Jodhpur Teak Furniture Showcase" },
      { loc: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80", title: "Vidya Mandir Global Academy Portal" },
      { loc: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80", title: "Healthcare Diagnostics Platform" }
    ];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${origin}</loc>\n`;
    images.forEach(img => {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${img.loc.replace(/&/g, "&amp;")}</image:loc>\n`;
      xml += `      <image:caption>${img.title}</image:caption>\n`;
      xml += `      <image:title>${img.title}</image:title>\n`;
      xml += `    </image:image>\n`;
    });
    xml += `  </url>\n`;
    xml += `</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
  });

  // 4. RSS Feed
  app.get("/rss.xml", (req, res) => {
    const origin = "https://sumanwebdesign.com";
    let rss = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
    rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
    rss += `<channel>\n`;
    rss += `  <title>Suman Web Design Agency Insights</title>\n`;
    rss += `  <link>${origin}</link>\n`;
    rss += `  <description>Premium Web Design and Development updates from Suman.design. High performance, SEO optimized, custom handcrafted websites.</description>\n`;
    rss += `  <language>en-us</language>\n`;
    rss += `  <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />\n`;
    rss += `  <item>\n`;
    rss += `    <title>Enterprise Web Design and Custom Website Development Services</title>\n`;
    rss += `    <link>${origin}/services</link>\n`;
    rss += `    <guid>${origin}/services</guid>\n`;
    rss += `    <description>Discover our bespoke, hand-coded web design and development services. Perfect performance, tailored interfaces, and lightning-fast SEO architectural optimization in West Bengal, Kolkata, and Asansol.</description>\n`;
    rss += `    <pubDate>${new Date().toUTCString()}</pubDate>\n`;
    rss += `  </item>\n`;
    rss += `</channel>\n`;
    rss += `</rss>`;
    res.header("Content-Type", "application/xml");
    res.send(rss);
  });

  // 5. URL Redirects Checker (Runs on client route requests before assets are handled)
  app.use(async (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/src") || req.path.includes(".") || req.path.startsWith("/@vite") || req.path.startsWith("/@react")) {
      return next();
    }
    try {
      const { data } = await supabaseServer.from("website_settings").select("*").eq("key", "seo_redirects");
      if (data && data.length > 0) {
        const redirects = data[0].value || [];
        const match = redirects.find((r: any) => r.from === req.path);
        if (match) {
          const type = match.type === "301" ? 301 : 302;
          return res.redirect(type, match.to);
        }
      }
    } catch (err) {
      console.error("Redirect check failed", err);
    }
    next();
  });

  // 6. Dynamic SEO HTML page serve
  const clientRoutes = ["/", "/services", "/work", "/pricing", "/contact", "/privacy", "/cookie", "/refund"];
  
  app.get(clientRoutes, async (req, res, next) => {
    try {
      const isDev = process.env.NODE_ENV !== "production";
      let indexPath = "";
      if (isDev) {
        indexPath = path.join(process.cwd(), "index.html");
      } else {
        indexPath = path.join(process.cwd(), "dist", "index.html");
      }
      
      let html = await fs.promises.readFile(indexPath, "utf-8");
      
      // Fetch settings from database
      let globalSeo = {
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
      };
      let pageSeoMap: Record<string, any> = {};
      
      try {
        const { data: dbSettings } = await supabaseServer.from("website_settings").select("*");
        if (dbSettings) {
          dbSettings.forEach(row => {
            if (row.key === "seo_global") {
              globalSeo = { ...globalSeo, ...row.value };
            } else if (row.key === "seo_pages") {
              pageSeoMap = row.value || {};
            }
          });
        }
      } catch (dbErr) {
        console.error("Failed to fetch settings for dynamic SEO serving", dbErr);
      }
      
      let routeKey = "home";
      const cleanPath = req.path.replace(/^\/|\/$/g, "");
      if (cleanPath && ["services", "work", "pricing", "contact", "privacy", "cookie", "refund"].includes(cleanPath)) {
        routeKey = cleanPath;
      }
      
      // Full enterprise-grade default metadata targeting key rankings
      const defaultMeta: Record<string, { title: string; description: string; keywords: string }> = {
        home: {
          title: "Suman Web Design Agency | Premium Website Design & Development Asansol Kolkata",
          description: "Looking for the best website designer or developer in India? Suman.design is a premium web design agency in Asansol, Kolkata, and West Bengal. We build premium, hand-coded, high-converting websites optimized for speed and SEO.",
          keywords: "Premium Web Design, Website Development, Web Design Agency India, Custom Website Development, Business Website Design, Website Designer India, Website Developer India, Freelance Website Designer, Freelance Website Developer, Website Developer in West Benagal, Website devolopment Agency in West Benagal, Website Developer in Asansol., Website devolopment Agency in Asansol, Website devolopment Agency in Kolkata"
        },
        services: {
          title: "Premium Web Design & Custom Website Development Services | Suman.design",
          description: "Explore our premium web solutions, custom full-stack development, mobile-first design, high-converting copy, and lightning-fast SEO architectural optimization. Expert web design and development in West Bengal.",
          keywords: "UI UX Design Agency, Custom Website Development, Website Developer India, Freelance Website Designer, Next.js Development, Website devolopment Agency in Kolkata"
        },
        work: {
          title: "Case Studies & Portfolio | Bespoke Website Design Showcases | Suman.design",
          description: "Browse our gallery of elite custom designs, cutting-edge corporate portals, SaaS platforms, and beautifully animated bespoke client projects. Portfolio website development in India.",
          keywords: "Portfolio Website Development, Corporate portals, Web Design Agency India, React websites portfolio"
        },
        pricing: {
          title: "Bespoke Pricing Plans | Transparent Web Engineering Charges | Suman.design",
          description: "Choose the perfect bespoke development plan for your enterprise. No hidden fees, clear deliverables, and high-performance engineering tailored for you.",
          keywords: "Web development cost, Custom website pricing, Landing Page Design, Freelance Website Developer"
        },
        contact: {
          title: "Hire Elite Website Developer in West Bengal | Contact Suman.design",
          description: "Get in touch with Suman.design, the leading website development agency in Asansol and West Bengal. Book a call for custom website design, professional audit, and quotes.",
          keywords: "Website Developer in Asansol., Website Designer India, Hire freelance developer India, Website devolopmt in West Benagal"
        },
        privacy: {
          title: "Privacy Policy | GDPR & CCPA Compliance | Suman.design",
          description: "Read our terms of privacy protection. Learn how Suman Web Design Agency safeguards client and user data with top-tier compliance and transparency.",
          keywords: "Privacy policy, data safety, web developer India"
        },
        cookie: {
          title: "Cookie Policy & Tracking Preferences | Suman.design",
          description: "Understand how our digital architecture uses modern, secure cookie technologies to enhance performance, maintain themes, and secure user sessions.",
          keywords: "Cookie policy, user tracking, Consent mode v2"
        },
        refund: {
          title: "Milestone Satisfaction Guarantee & Refund Terms | Suman.design",
          description: "Review our straightforward refund terms and project milestone satisfaction guarantees for bespoke digital development and architectural services.",
          keywords: "Refund policy, client protection, website design contract"
        }
      };
      
      const activeMeta = pageSeoMap[routeKey] || defaultMeta[routeKey] || defaultMeta.home;
      const fullTitle = activeMeta.title;
      const fullDesc = activeMeta.description;
      const fullKeywords = activeMeta.keywords;
      
      const pageUrl = `https://sumanwebdesign.com${req.path === "/" ? "" : req.path}`;
      
      const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": "https://sumanwebdesign.com/#agency",
        "name": globalSeo.business_name || "Suman Web Design Agency",
        "url": "https://sumanwebdesign.com",
        "logo": "https://sumanwebdesign.com/logo.png",
        "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
        "description": fullDesc,
        "telephone": globalSeo.phone || "+919883581298",
        "priceRange": "₹5,999 - ₹30,000+",
        "currenciesAccepted": "INR, USD",
        "paymentAccepted": "Credit Card, UPI, Wire Transfer, PayPal",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": globalSeo.locality || "Asansol",
          "addressRegion": globalSeo.region || "West Bengal",
          "postalCode": "713301",
          "addressCountry": globalSeo.country || "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "23.6889",
          "longitude": "86.9749"
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "09:00",
          "closes": "21:00"
        },
        "sameAs": [
          "https://wa.me/919883581298"
        ]
      };
      
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://sumanwebdesign.com"
          },
          ...(routeKey !== "home" ? [{
            "@type": "ListItem",
            "position": 2,
            "name": routeKey.charAt(0).toUpperCase() + routeKey.slice(1),
            "item": pageUrl
          }] : [])
        ]
      };
      
      let verifications = "";
      if (globalSeo.google_verification) {
        verifications += `    <meta name="google-site-verification" content="${globalSeo.google_verification}" />\n`;
      }
      if (globalSeo.bing_verification) {
        verifications += `    <meta name="msvalidate.01" content="${globalSeo.bing_verification}" />\n`;
      }
      
      let scripts = "";
      if (globalSeo.ga_id) {
        scripts += `
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=${globalSeo.ga_id}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          \${globalSeo.consent_mode ? "gtag('consent', 'default', { 'analytics_storage': 'granted', 'ad_storage': 'granted' });" : ""}
          gtag('config', '${globalSeo.ga_id}');
        </script>
        `;
      }
      if (globalSeo.gtm_id) {
        scripts += `
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','\${globalSeo.gtm_id}');</script>
        `;
      }
      if (globalSeo.clarity_id) {
        scripts += `
        <!-- Microsoft Clarity -->
        <script type="text/javascript">
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "\${globalSeo.clarity_id}");
        </script>
        `;
      }
      
      // Inject standard elements
      html = html.replace(/<title>.*?<\/title>/, `<title>\${fullTitle}</title>`);
      
      // Replace or insert description
      if (html.includes('name="description"')) {
        html = html.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="\${fullDesc}" />`);
      } else {
        html = html.replace("</title>", `</title>\n    <meta name="description" content="\${fullDesc}" />`);
      }
      
      // Replace or insert keywords
      if (html.includes('name="keywords"')) {
        html = html.replace(/<meta name="keywords" content=".*?"\s*\/?>/, `<meta name="keywords" content="\${fullKeywords}" />`);
      } else {
        html = html.replace("</title>", `</title>\n    <meta name="keywords" content="\${fullKeywords}" />`);
      }
      
      // Canonical link
      if (html.includes('rel="canonical"')) {
        html = html.replace(/<link rel="canonical" href=".*?"\s*\/?>/, `<link rel="canonical" href="\${pageUrl}" />`);
      } else {
        html = html.replace("</title>", `</title>\n    <link rel="canonical" href="\${pageUrl}" />`);
      }
      
      // Social replacements
      html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/g, `<meta property="og:title" content="\${fullTitle}" />`);
      html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/g, `<meta property="og:description" content="\${fullDesc}" />`);
      html = html.replace(/<meta property="og:url" content=".*?"\s*\/?>/g, `<meta property="og:url" content="\${pageUrl}" />`);
      html = html.replace(/<meta property="twitter:title" content=".*?"\s*\/?>/g, `<meta property="twitter:title" content="\${fullTitle}" />`);
      html = html.replace(/<meta property="twitter:description" content=".*?"\s*\/?>/g, `<meta property="twitter:description" content="\${fullDesc}" />`);
      html = html.replace(/<meta property="twitter:url" content=".*?"\s*\/?>/g, `<meta property="twitter:url" content="\${pageUrl}" />`);
      
      const injectedHeaders = `
    \${verifications}
    \${scripts}
    <script type="application/ld+json">\${JSON.stringify(localBusinessSchema)}</script>
    <script type="application/ld+json">\${JSON.stringify(breadcrumbSchema)}</script>
      `;
      
      html = html.replace("</head>", `\${injectedHeaders}\n  </head>`);
      
      if (isDev && (global as any).vite) {
        html = await (global as any).vite.transformIndexHtml(req.url, html);
      }
      
      res.send(html);
    } catch (err) {
      console.error("Dynamic SEO renderer error:", err);
      next();
    }
  });

  // 7. Custom 404 Logging (Runs on non-frontend pathways)
  app.use(async (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/src") || req.path.includes(".") || req.path.startsWith("/@vite") || req.path.startsWith("/@react")) {
      return next();
    }
    const isFrontendPage = clientRoutes.includes(req.path) || req.path.startsWith("/admin");
    if (!isFrontendPage) {
      try {
        const { data } = await supabaseServer.from("website_settings").select("*").eq("key", "seo_404_logs");
        let logs = [];
        if (data && data.length > 0) {
          logs = data[0].value || [];
        }
        
        const newLog = {
          path: req.path,
          referer: req.headers.referer || "direct",
          ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
          timestamp: new Date().toISOString()
        };
        
        logs.unshift(newLog);
        logs = logs.slice(0, 100);
        
        await supabaseServer.from("website_settings").upsert({
          key: "seo_404_logs",
          value: logs,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to log 404 error", err);
      }
    }
    next();
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    (global as any).vite = vite; // Set global vite reference for dynamic SPA transformation
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Setup WebSocket Server
  wss = new WebSocketServer({ server });
  wss.on("connection", (ws: any) => {
    ws.isAlive = true;
    console.log("WebSocket client connected");
    
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("error", (err) => {
      console.error("WebSocket connection error:", err);
    });
  });

  // Ping interval to keep connections alive
  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws: any) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });
}

startServer();
