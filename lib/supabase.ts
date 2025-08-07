import { createClient } from "@supabase/supabase-js";

// Validar que las variables de entorno existan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

if (!supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

// Validar formato de URL
if (
  !supabaseUrl.startsWith("https://") ||
  !supabaseUrl.includes(".supabase.co")
) {
  throw new Error(
    "Invalid NEXT_PUBLIC_SUPABASE_URL format. Should be: https://your-project.supabase.co"
  );
}

// Cliente para el lado del cliente (navegador)
export const createClientComponentClient = () =>
  createClient(supabaseUrl, supabaseAnonKey);

// Cliente para el lado del servidor (Server Actions, Route Handlers)
export const createServerActionClient = () =>
  createClient(supabaseUrl, supabaseServiceRoleKey);
