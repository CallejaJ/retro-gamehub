import { createClient } from "@supabase/supabase-js";

// Cliente para el lado del cliente (navegador)
export const createClientComponentClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Cliente para el lado del servidor (Server Actions, Route Handlers)
export const createServerActionClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar la clave de rol de servicio para el servidor
  );
