import { createClient } from "@supabase/supabase-js";

// Validar que las variables de entorno existan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
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

// Tipos de las tablas de la base de datos
export interface Comment {
  id: string;
  user_name: string;
  game_name: string;
  rating: number;
  comment_text: string;
  likes: number;
  created_at: string;
}

export interface Score {
  id: string;
  user_name: string;
  game_name: string;
  score: number;
  created_at: string;
}

// Cliente para el lado del cliente (navegador)
export const createClientComponentClient = () =>
  createClient(supabaseUrl, supabaseAnonKey);

// Cliente para Server Actions / Server Components.
// Usa la anon key: la seguridad la garantizan las políticas RLS de la base
// de datos, no la clave. La service role key NUNCA debe usarse en endpoints
// accesibles públicamente (las server actions lo son).
export const createServerActionClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
