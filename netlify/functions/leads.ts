import { Handler } from "@netlify/functions";
import { supabaseAdmin } from "../../src/lib/supabase/admin";
import {
  corsHeaders,
  buildResponse,
  verifyAdmin,
  getPathId,
  normalizeLeads,
  leadSchema,
  logAudit,
  notifyAdmin,
} from "./utils";

const leadSubmissionsRateLimit = new Map<string, number[]>();

const checkLeadRateLimit = (ip: string) => {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const limit = 3;

  let submissions = leadSubmissionsRateLimit.get(ip) || [];
  submissions = submissions.filter(timestamp => now - timestamp < windowMs);
  
  if (submissions.length >= limit) {
    const oldest = Math.min(...submissions);
    const waitTimeMs = windowMs - (now - oldest);
    return { allowed: false, waitTimeMs };
  }

  submissions.push(now);
  leadSubmissionsRateLimit.set(ip, submissions);
  return { allowed: true, waitTimeMs: 0 };
};

export const handler: Handler = async (event, context) => {
  const { httpMethod, path, body, headers } = event;

  if (httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    if (httpMethod === "GET") {
      // Admin verification
      await verifyAdmin(event);

      const { data, error } = await supabaseAdmin
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return buildResponse(200, normalizeLeads(data || []));
    }

    if (httpMethod === "POST") {
      const clientIp = headers["x-forwarded-for"] || "unknown-ip";
      const rateCheck = checkLeadRateLimit(clientIp);
      if (!rateCheck.allowed) {
        return buildResponse(429, {
          error: "Rate limit exceeded. You can only send up to 3 contact forms every 5 minutes.",
          waitTime: Math.ceil(rateCheck.waitTimeMs / 1000)
        });
      }

      const parsedData = leadSchema.parse(JSON.parse(body || "{}"));
      let finalLead: any = null;

      const insertObject: any = {
        name: parsedData.name,
        client_name: parsedData.name,
        email: parsedData.email,
        phone: parsedData.phone || null,
        whatsapp_number: parsedData.phone || "Not Provided",
        business_name: parsedData.business_name || null,
        company_size: parsedData.company_size || null,
        project_type: parsedData.project_type || "Custom Website",
        budget: parsedData.budget || "Not Specified",
        timeline: parsedData.timeline || "Flexible",
        country: parsedData.country || "India",
        message: parsedData.message || "",
        source_page: parsedData.source_page || "Contact Page",
        referral_source: parsedData.referral_source || "Direct",
        status: "new",
      };

      const { data, error } = await supabaseAdmin
        .from("leads")
        .insert(insertObject)
        .select();

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

      return buildResponse(200, { success: true, lead: finalLead });
    }

    if (httpMethod === "PUT") {
      // Admin verification
      await verifyAdmin(event);

      const id = getPathId(path, "leads") || event.queryStringParameters?.id;
      if (!id) {
        return buildResponse(400, { error: "Lead ID is required" });
      }

      const { status } = JSON.parse(body || "{}");
      if (!status) {
        return buildResponse(400, { error: "Status is required" });
      }

      const { data, error } = await supabaseAdmin
        .from("leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return buildResponse(404, { error: "Lead not found" });
      }

      await logAudit("admin", "UPDATE", "leads", null, { id, status });
      return buildResponse(200, { success: true, lead: normalizeLeads([data[0]])[0] });
    }

    if (httpMethod === "DELETE") {
      // Admin verification
      await verifyAdmin(event);

      const id = getPathId(path, "leads") || event.queryStringParameters?.id;
      if (!id) {
        return buildResponse(400, { error: "Lead ID is required" });
      }

      const { error } = await supabaseAdmin.from("leads").delete().eq("id", id);
      if (error) throw error;

      await logAudit("admin", "DELETE", "leads", { id }, null);
      return buildResponse(200, { success: true });
    }

    return buildResponse(405, { error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("Leads API Error:", err);
    return buildResponse(err.message?.includes("Unauthorized") ? 401 : 500, { error: err.message });
  }
};
