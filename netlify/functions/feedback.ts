import { Handler } from "@netlify/functions";
import { supabaseAdmin } from "../../src/lib/supabase/admin";
import {
  corsHeaders,
  buildResponse,
  verifyAdmin,
  getPathId,
  feedbackSchema,
  notifyAdmin,
} from "./utils";

export const handler: Handler = async (event, context) => {
  const { httpMethod, path, body } = event;

  if (httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    if (httpMethod === "POST") {
      const parsedData = feedbackSchema.parse(JSON.parse(body || "{}"));
      let finalFeedback: any = null;

      const { data, error } = await supabaseAdmin
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

      return buildResponse(200, { success: true, feedback: finalFeedback });
    }

    if (httpMethod === "GET") {
      // Admin verification
      await verifyAdmin(event);

      const { data, error } = await supabaseAdmin
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return buildResponse(200, data || []);
    }

    if (httpMethod === "DELETE") {
      // Admin verification
      await verifyAdmin(event);

      const id = getPathId(path, "feedback") || event.queryStringParameters?.id;
      if (!id) {
        return buildResponse(400, { error: "Feedback ID is required" });
      }

      const { error } = await supabaseAdmin.from("feedback").delete().eq("id", id);
      if (error) throw error;

      return buildResponse(200, { success: true });
    }

    return buildResponse(405, { error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("Feedback API Error:", err);
    return buildResponse(err.message?.includes("Unauthorized") ? 401 : 500, { error: err.message });
  }
};
