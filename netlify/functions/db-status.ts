import { Handler } from "@netlify/functions";
import { supabaseAdmin } from "../../src/lib/supabase/admin";
import { corsHeaders, buildResponse } from "./utils";

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return buildResponse(405, { error: "Method Not Allowed" });
  }

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
        const { error } = await supabaseAdmin.from(table.dbName).select("*").limit(1);
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

  return buildResponse(200, {
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
};
