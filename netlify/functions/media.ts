import { Handler } from "@netlify/functions";
import { supabaseAdmin } from "../../src/lib/supabase/admin";
import {
  corsHeaders,
  buildResponse,
  verifyAdmin,
  getPathId,
  logActivity,
} from "./utils";

export const handler: Handler = async (event, context) => {
  const { httpMethod, path, body } = event;

  if (httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    // Admin verification required for all Media operations
    await verifyAdmin(event);

    if (httpMethod === "POST") {
      const { filename, size, mimetype, base64Data, folder } = JSON.parse(body || "{}");
      if (!filename || !base64Data) {
        return buildResponse(400, { error: "Filename and base64Data required" });
      }

      // Try to upload to Supabase Storage bucket, or fallback to saving URL/Base64 directly in media_library
      const mediaUrl = base64Data.startsWith("data:") ? base64Data : `data:${mimetype};base64,${base64Data}`;

      const { data, error } = await supabaseAdmin
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
      return buildResponse(200, { success: true, media: data?.[0] });
    }

    if (httpMethod === "GET") {
      const { data, error } = await supabaseAdmin
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return buildResponse(200, data || []);
    }

    if (httpMethod === "DELETE") {
      const id = getPathId(path, "media") || event.queryStringParameters?.id;
      if (!id) {
        return buildResponse(400, { error: "Media ID is required" });
      }

      const { error } = await supabaseAdmin.from("media_library").delete().eq("id", id);
      if (error) throw error;

      return buildResponse(200, { success: true });
    }

    return buildResponse(405, { error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("Media API Error:", err);
    return buildResponse(err.message?.includes("Unauthorized") ? 401 : 500, { error: err.message });
  }
};
