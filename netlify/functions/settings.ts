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
  const { httpMethod, body } = event;

  if (httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    if (httpMethod === "GET") {
      const { data, error } = await supabaseAdmin.from("website_settings").select("*");
      if (error) throw error;

      const settingsObj: any = {};
      (data || []).forEach((s) => {
        settingsObj[s.key] = s.value;
      });

      return buildResponse(200, settingsObj);
    }

    if (httpMethod === "POST") {
      // Admin verification
      await verifyAdmin(event);

      const { key, value } = JSON.parse(body || "{}");
      if (!key) {
        return buildResponse(400, { error: "Settings Key is required" });
      }

      const { data, error } = await supabaseAdmin
        .from("website_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() })
        .select();

      if (error) throw error;

      await logActivity("Update Settings", `Updated website configuration key: ${key}`);
      await logAudit("admin", "UPSERT", "website_settings", null, { key, value });

      return buildResponse(200, { success: true, setting: data?.[0] });
    }

    return buildResponse(405, { error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("Settings API Error:", err);
    return buildResponse(err.message?.includes("Unauthorized") ? 401 : 500, { error: err.message });
  }
};
