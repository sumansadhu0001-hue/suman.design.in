import { createClient, SupabaseClient } from "@supabase/supabase-js";

let instance: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!instance) {
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase credentials missing! Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.");
    }
    // Clean up trailing /rest/v1 or trailing slashes
    supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

    instance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Server interactions should typically not persist user sessions globally
      }
    });
  }
  return instance;
}

export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
});

