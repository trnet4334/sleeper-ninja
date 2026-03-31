import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseEnvConfig {
  url: string;
  anonKey?: string;
  serviceKey?: string;
}

export function readSupabaseEnv(env: Record<string, string | undefined> = import.meta.env): SupabaseEnvConfig {
  return {
    url: env.VITE_SUPABASE_URL ?? env.SUPABASE_URL ?? "",
    anonKey: env.VITE_SUPABASE_ANON_KEY,
    serviceKey: env.SUPABASE_SERVICE_KEY
  };
}

export function createBrowserSupabaseClient(
  env: Record<string, string | undefined> = import.meta.env
): SupabaseClient | null {
  const config = readSupabaseEnv(env);
  if (!config.url || !config.anonKey) {
    return null;
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false
    }
  });
}

export function createServerSupabaseClient(env: Record<string, string | undefined>): SupabaseClient | null {
  const config = readSupabaseEnv(env);
  if (!config.url || !config.serviceKey) {
    return null;
  }

  return createClient(config.url, config.serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
