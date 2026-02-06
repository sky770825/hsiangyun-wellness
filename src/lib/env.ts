/**
 * 環境變數（僅讀取 VITE_ 開頭，建置時注入）
 * 未設定時為空字串，各 service 可據此判斷是否啟用後端
 */

const env = {
  get SUPABASE_URL() {
    return import.meta.env.VITE_SUPABASE_URL ?? '';
  },
  get SUPABASE_ANON_KEY() {
    return import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  },
  get SUPABASE_AUTH_ENABLED() {
    return import.meta.env.VITE_SUPABASE_AUTH_ENABLED === 'true';
  },
};

export const hasSupabase = () => Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);

export default env;
