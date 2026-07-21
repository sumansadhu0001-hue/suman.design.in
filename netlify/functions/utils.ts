import { supabaseAdmin } from "../../src/lib/supabase/admin";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export const leadSchema = z.object({
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

export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  emoji: z.string().optional(),
  message: z.string().optional(),
  page_url: z.string().optional(),
});

export const projectSchema = z.object({
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

export function buildResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
    body: JSON.stringify(body),
  };
}

export async function verifyAdmin(event: any) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized access. No token provided.");
  }
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new Error("Session expired or invalid. Please log in again.");
  }
  return user;
}

export function getPathId(path: string, functionName: string) {
  // Handles extracting ID from path like /_netlify/functions/leads/123-456
  const parts = path.split("/");
  const funcIndex = parts.indexOf(functionName);
  if (funcIndex !== -1 && parts[funcIndex + 1]) {
    return parts[funcIndex + 1];
  }
  return null;
}

export function normalizeLeads(leads: any[]): any[] {
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

export async function logAudit(user: string, actionType: string, tableName: string, oldData: any = null, newData: any = null) {
  try {
    await supabaseAdmin.from("audit_logs").insert({
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

export async function logActivity(action: string, description: string) {
  try {
    await supabaseAdmin.from("activity_logs").insert({
      action,
      description,
    });
  } catch (err) {
    console.error("Failed to write activity log to Supabase:", err);
  }
}

export async function notifyAdmin(title: string, message: string, type: string = "info") {
  try {
    await supabaseAdmin.from("notifications").insert({
      title,
      message,
      type,
      is_read: false,
    });
  } catch (err) {
    console.error("Failed to write system notification to Supabase:", err);
  }
}
