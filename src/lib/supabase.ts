/**
 * Supabase 客戶端（僅在已設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY 時建立）
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import env from '@/lib/env';

let client: SupabaseClient | null = null;

/**
 * 取得 Supabase 客戶端；未設定環境變數時回傳 null
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  if (!client) {
    client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }
  return client;
}
