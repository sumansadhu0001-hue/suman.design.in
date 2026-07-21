import { Handler } from "@netlify/functions";
import { supabaseAdmin } from "../../src/lib/supabase/admin";
import {
  corsHeaders,
  buildResponse,
  verifyAdmin,
  getPathId,
  projectSchema,
  logActivity,
  logAudit,
  notifyAdmin,
} from "./utils";

export const handler: Handler = async (event, context) => {
  const { httpMethod, path, body } = event;

  if (httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    if (httpMethod === "GET") {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .select("*");

      if (error) throw error;

      const projects = data || [];
      projects.sort((a, b) => {
        const orderA = typeof a.sort_order === "number" ? a.sort_order : 0;
        const orderB = typeof b.sort_order === "number" ? b.sort_order : 0;
        return orderA - orderB;
      });
      return buildResponse(200, projects);
    }

    if (httpMethod === "POST") {
      // Admin verification
      await verifyAdmin(event);

      const parsedData = projectSchema.parse(JSON.parse(body || "{}"));

      const { data, error } = await supabaseAdmin
        .from("projects")
        .insert(parsedData)
        .select();

      if (error) throw error;

      await logActivity("Add Project", `Added new project: ${parsedData.title}`);
      await logAudit("admin", "INSERT", "projects", null, parsedData);
      await notifyAdmin("Project Added", `A new project "${parsedData.title}" has been published.`, "info");

      return buildResponse(200, { success: true, project: data?.[0] });
    }

    if (httpMethod === "PUT") {
      // Admin verification
      await verifyAdmin(event);

      const id = getPathId(path, "projects") || event.queryStringParameters?.id;
      if (!id) {
        return buildResponse(400, { error: "Project ID is required" });
      }

      const parsedData = projectSchema.parse(JSON.parse(body || "{}"));

      const { data, error } = await supabaseAdmin
        .from("projects")
        .update({ ...parsedData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return buildResponse(404, { error: "Project not found" });
      }

      await logActivity("Update Project", `Updated project: ${parsedData.title}`);
      await logAudit("admin", "UPDATE", "projects", null, parsedData);

      return buildResponse(200, { success: true, project: data[0] });
    }

    if (httpMethod === "DELETE") {
      // Admin verification
      await verifyAdmin(event);

      const id = getPathId(path, "projects") || event.queryStringParameters?.id;
      if (!id) {
        return buildResponse(400, { error: "Project ID is required" });
      }

      const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);
      if (error) throw error;

      await logActivity("Delete Project", `Deleted project ID ${id}`);
      await logAudit("admin", "DELETE", "projects", { id }, null);

      return buildResponse(200, { success: true });
    }

    return buildResponse(405, { error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("Projects API Error:", err);
    return buildResponse(err.message?.includes("Unauthorized") ? 401 : 500, { error: err.message });
  }
};
