import { Handler } from "@netlify/functions";
import { supabaseAdmin } from "../../src/lib/supabase/admin";
import {
  corsHeaders,
  buildResponse,
  verifyAdmin,
  normalizeLeads,
} from "./utils";

export const handler: Handler = async (event, context) => {
  const { httpMethod, path, body } = event;

  if (httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    // Determine the action by checking subpath or query parameter
    let action = "";
    if (path.includes("/session")) action = "session";
    else if (path.includes("/view")) action = "view";
    else if (path.includes("/click")) action = "click";
    else if (path.includes("/event")) action = "event";
    else if (path.includes("/stats")) action = "stats";
    else {
      // Fallback to checking query parameter or last path segment
      const lastSegment = path.split("/").pop();
      if (lastSegment && ["session", "view", "click", "event", "stats"].includes(lastSegment)) {
        action = lastSegment;
      } else {
        action = event.queryStringParameters?.type || "";
      }
    }

    if (action === "stats") {
      if (httpMethod !== "GET") {
        return buildResponse(405, { error: "Method Not Allowed" });
      }
      // Admin verification
      await verifyAdmin(event);

      const sessionsRes = await supabaseAdmin.from("visitor_sessions").select("*");
      if (sessionsRes.error) throw sessionsRes.error;

      const viewsRes = await supabaseAdmin.from("page_views").select("*");
      if (viewsRes.error) throw viewsRes.error;

      const leadsRes = await supabaseAdmin.from("leads").select("*");
      if (leadsRes.error) throw leadsRes.error;

      const feedbackRes = await supabaseAdmin.from("feedback").select("*");
      if (feedbackRes.error) throw feedbackRes.error;

      // Handle potentially missing click_events table gracefully
      let rawClicks: any[] = [];
      const clicksRes = await supabaseAdmin.from("click_events").select("*");
      if (!clicksRes.error && clicksRes.data) {
        rawClicks = clicksRes.data;
      } else {
        console.log("click_events table not available, fallback to searching click events in analytics_events");
        const aeRes = await supabaseAdmin.from("analytics_events").select("*").eq("event_type", "click");
        if (!aeRes.error && aeRes.data) {
          rawClicks = aeRes.data.map((ae: any) => ({
            id: ae.id,
            session_id: ae.session_id || ae.visitor_id || "",
            element_id: ae.event_name || "",
            element_class: ae.page_name || "",
            text: ae.event_name || "",
            x: 0,
            y: 0,
            created_at: ae.created_at,
          }));
        }
      }

      const totalSessions = sessionsRes.data?.length || 0;

      // Normalize page views to ensure both schemas map perfectly to UI
      const normalizedViews = (viewsRes.data || []).map((v: any) => ({
        id: v.id,
        session_id: v.session_id || v.visitor_id || "",
        url: v.url || v.page_name || "/",
        title: v.title || v.page_name || "Page View",
        referrer: v.referrer || "",
        time_spent: v.time_spent !== undefined ? v.time_spent : (v.session_duration || 0),
        scroll_percentage: v.scroll_percentage || 0,
        created_at: v.created_at,
      }));

      const totalViews = normalizedViews.length;
      const totalLeads = leadsRes.data?.length || 0;
      const totalFeedback = feedbackRes.data?.length || 0;

      let avgRating = 0;
      if (feedbackRes.data && feedbackRes.data.length > 0) {
        const sum = feedbackRes.data.reduce((acc, f) => acc + (f.rating || 0), 0);
        avgRating = parseFloat((sum / feedbackRes.data.length).toFixed(1));
      }

      // Normalize click events
      const normalizedClicks = rawClicks.map((c: any) => ({
        id: c.id,
        session_id: c.session_id || "",
        element_id: c.element_id || "",
        element_class: c.element_class || "",
        text: c.text || "",
        x: c.x || 0,
        y: c.y || 0,
        created_at: c.created_at,
      }));

      return buildResponse(200, {
        summary: {
          total_sessions: totalSessions,
          total_views: totalViews,
          total_leads: totalLeads,
          total_feedback: totalFeedback,
          average_rating: avgRating,
        },
        sessions: sessionsRes.data || [],
        views: normalizedViews,
        leads: normalizeLeads(leadsRes.data || []),
        feedback: feedbackRes.data || [],
        clicks: normalizedClicks,
      });
    }

    // Public visitor endpoints (POST)
    if (httpMethod !== "POST") {
      return buildResponse(405, { error: "Method Not Allowed" });
    }

    const payload = JSON.parse(body || "{}");

    // Helper to dynamically fetch session details when falling back to old column structures
    const getSessionInfo = async (sid: string) => {
      const { data } = await supabaseAdmin
        .from("visitor_sessions")
        .select("*")
        .eq("id", sid)
        .maybeSingle();
      return data || {};
    };

    // Helper to ensure visitor exists in visitors table for old schema FK constraints
    const ensureVisitorExists = async (visitorId: string) => {
      try {
        await supabaseAdmin
          .from("visitors")
          .upsert({ id: visitorId });
      } catch (err) {
        console.warn("Failed to upsert visitor:", err);
      }
    };

    if (action === "session") {
      const {
        visitor_id,
        landing_page,
        referral_source,
        device,
        browser,
        os,
        language,
        country,
        city,
        utm_source,
        utm_medium,
        utm_campaign,
      } = payload;

      const { data, error } = await supabaseAdmin
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
          session_duration: 0,
        })
        .select();

      if (error) throw error;
      return buildResponse(200, { session_id: data?.[0]?.id });
    }

    if (action === "view") {
      const { session_id, url, title, referrer, scroll_percentage, time_spent } = payload;
      if (!session_id) {
        return buildResponse(400, { error: "Session ID required" });
      }

      // Try inserting with the new schema columns
      const newSchemaInsert = await supabaseAdmin
        .from("page_views")
        .insert({
          session_id,
          url,
          title,
          referrer,
          scroll_percentage: scroll_percentage || 0,
          time_spent: time_spent || 0,
        });

      if (newSchemaInsert.error) {
        console.log("Analytics: using legacy schema path for page view");
        const session = await getSessionInfo(session_id);
        const visitorId = session.visitor_id || "unknown";
        await ensureVisitorExists(visitorId);
        const oldSchemaInsert = await supabaseAdmin
          .from("page_views")
          .insert({
            visitor_id: visitorId,
            page_name: title || url || "Page View",
            referrer: referrer || "",
            utm_source: session.utm_source || "",
            utm_medium: session.utm_medium || "",
            utm_campaign: session.utm_campaign || "",
            session_duration: time_spent || 0
          });
        if (oldSchemaInsert.error) {
          throw oldSchemaInsert.error;
        }
      }

      if (time_spent > 0) {
        const { data: session } = await supabaseAdmin
          .from("visitor_sessions")
          .select("session_duration")
          .eq("id", session_id)
          .maybeSingle();

        if (session) {
          const newDuration = (session.session_duration || 0) + time_spent;
          await supabaseAdmin
            .from("visitor_sessions")
            .update({ session_duration: newDuration, updated_at: new Date().toISOString() })
            .eq("id", session_id);
        }
      }

      return buildResponse(200, { success: true });
    }

    if (action === "click") {
      const { session_id, element_id, element_class, text, x, y } = payload;
      if (!session_id) {
        return buildResponse(400, { error: "Session ID required" });
      }

      // Try inserting into click_events
      const clickInsert = await supabaseAdmin
        .from("click_events")
        .insert({ session_id, element_id, element_class, text, x, y });

      if (clickInsert.error) {
        console.log("Analytics: mapping interaction event");

        // Try insert as analytics_event under type "click" using new schema
        const aeNewInsert = await supabaseAdmin
          .from("analytics_events")
          .insert({
            session_id,
            event_type: "click",
            event_name: text || element_id || "Click",
            event_data: { element_id, element_class, text, x, y }
          });

        if (aeNewInsert.error) {
          console.log("Analytics: using legacy schema path for click");
          const session = await getSessionInfo(session_id);
          const visitorId = session.visitor_id || "unknown";
          await ensureVisitorExists(visitorId);
          const aeOldInsert = await supabaseAdmin
            .from("analytics_events")
            .insert({
              visitor_id: visitorId,
              page_name: element_class || "Click",
              event_name: text || element_id || "Click",
              event_type: "click"
            });
          if (aeOldInsert.error) {
            throw aeOldInsert.error;
          }
        }
      }

      return buildResponse(200, { success: true });
    }

    if (action === "event") {
      const { session_id, event_type, event_name, event_data } = payload;
      if (!session_id) {
        return buildResponse(400, { error: "Session ID required" });
      }

      const aeNewInsert = await supabaseAdmin
        .from("analytics_events")
        .insert({ session_id, event_type, event_name, event_data: event_data || {} });

      if (aeNewInsert.error) {
        console.log("Analytics: using legacy schema path for custom event");
        const session = await getSessionInfo(session_id);
        const visitorId = session.visitor_id || "unknown";
        await ensureVisitorExists(visitorId);
        const aeOldInsert = await supabaseAdmin
          .from("analytics_events")
          .insert({
            visitor_id: visitorId,
            page_name: event_data?.page || event_data?.url || "Unknown",
            event_name: event_name || "Event",
            event_type: event_type || "custom"
          });
        if (aeOldInsert.error) {
          throw aeOldInsert.error;
        }
      }

      return buildResponse(200, { success: true });
    }

    return buildResponse(400, { error: `Unknown analytics action: ${action}` });
  } catch (err: any) {
    console.log("Analytics status logged:", err?.message || err);
    return buildResponse(err.message?.includes("Unauthorized") ? 401 : 500, { error: err.message });
  }
};
