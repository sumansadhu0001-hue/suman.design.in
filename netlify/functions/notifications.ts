import { Handler } from "@netlify/functions";
import { supabaseAdmin } from "../../src/lib/supabase/admin";
import {
  corsHeaders,
  buildResponse,
  verifyAdmin,
} from "./utils";

export const handler: Handler = async (event, context) => {
  const { httpMethod, path, body } = event;

  if (httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    // Admin verification is required for all notification operations
    await verifyAdmin(event);

    if (httpMethod === "GET") {
      const { data, error } = await supabaseAdmin
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return buildResponse(200, data || []);
    }

    if (httpMethod === "POST") {
      // Handles reading/marking a notification as read (POST /read)
      const { id } = JSON.parse(body || "{}");
      if (!id) {
        return buildResponse(400, { error: "Notification ID is required" });
      }

      const { error } = await supabaseAdmin
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      return buildResponse(200, { success: true });
    }

    return buildResponse(405, { error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("Notifications API Error:", err);
    return buildResponse(err.message?.includes("Unauthorized") ? 401 : 500, { error: err.message });
  }
};
