import { Handler } from "@netlify/functions";
import { supabaseAdmin } from "../../src/lib/supabase/admin";
import {
  corsHeaders,
  buildResponse,
  verifyAdmin,
  logActivity,
  logAudit,
} from "./utils";

export const handler: Handler = async (event, context) => {
  const { httpMethod, path, body } = event;

  if (httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    // Admin verification is strictly required for all Admin functions
    await verifyAdmin(event);

    let action = "";
    if (path.includes("/live")) action = "live";
    else if (path.includes("/logs")) action = "logs";
    else if (path.includes("/purge-demo")) action = "purge-demo";
    else {
      const lastSegment = path.split("/").pop();
      if (lastSegment && ["live", "logs", "purge-demo"].includes(lastSegment)) {
        action = lastSegment;
      } else {
        action = event.queryStringParameters?.action || "";
      }
    }

    if (action === "live") {
      if (httpMethod !== "GET") {
        return buildResponse(405, { error: "Method Not Allowed" });
      }

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data, error } = await supabaseAdmin
        .from("visitor_sessions")
        .select("*")
        .gt("updated_at", fiveMinutesAgo);

      if (error) throw error;
      return buildResponse(200, { online_count: data?.length || 0 });
    }

    if (action === "logs") {
      if (httpMethod !== "GET") {
        return buildResponse(405, { error: "Method Not Allowed" });
      }

      const activityRes = await supabaseAdmin
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      const auditRes = await supabaseAdmin
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      return buildResponse(200, {
        activity: activityRes.data || [],
        audit: auditRes.data || [],
      });
    }

    if (action === "purge-demo") {
      if (httpMethod !== "POST") {
        return buildResponse(405, { error: "Method Not Allowed" });
      }

      const { type } = JSON.parse(body || "{}"); // 'demo_only' or 'all_data'

      if (type === "all_data") {
        const { error: pErr } = await supabaseAdmin.from("projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        const { error: lErr } = await supabaseAdmin.from("leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        const { error: fErr } = await supabaseAdmin.from("feedback").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        
        if (pErr) throw pErr;
        if (lErr) throw lErr;
        if (fErr) throw fErr;
        
        await logActivity("Purge All Data", "Admin fully purged all projects, leads, and feedback from database.");
        await logAudit("admin", "PURGE", "multiple", null, { type: "all_data" });
      } else {
        const { error: pErr } = await supabaseAdmin.from("projects").delete().in("title", ["Aether Boutique", "Apex Dashboard"]);
        const { error: lErr } = await supabaseAdmin.from("leads").delete().in("email", ["test@example.com", "client@company.com"]);
        const { error: fErr } = await supabaseAdmin.from("feedback").delete().eq("message", "This is an automated test feedback submission.");
        
        if (pErr) throw pErr;
        if (lErr) throw lErr;
        if (fErr) throw fErr;

        await logActivity("Purge Demo Data", "Admin purged default demo/seed items from database.");
        await logAudit("admin", "PURGE", "multiple", null, { type: "demo_only" });
      }

      return buildResponse(200, { success: true, message: "Data purged successfully!" });
    }

    return buildResponse(400, { error: `Unknown admin action: ${action}` });
  } catch (err: any) {
    console.error("Admin API Error:", err);
    return buildResponse(err.message?.includes("Unauthorized") ? 401 : 500, { error: err.message });
  }
};
