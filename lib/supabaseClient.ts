import { createClient } from "@supabase/supabase-js";

// Supabaseクライアントの共通設定
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
