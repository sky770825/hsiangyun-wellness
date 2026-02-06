-- ============================================
-- 身心靈瘦身教練 (Hsiang-Yun) - Supabase 資料表
-- ============================================
-- 表名前綴：hsiangyun（對應 config/supabase-naming.ts）
-- 執行：在 Supabase Dashboard → SQL Editor 貼上並執行，或使用 supabase db push
-- ============================================

-- ----------------------------------------
-- 1. 預約資訊 hsiangyun_bookings
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.hsiangyun_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.hsiangyun_bookings IS '預約表單提交（前台表單寫入，後台管理）';

-- ----------------------------------------
-- 2. 會員／學員名單（CRM）hsiangyun_members
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.hsiangyun_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  source text NOT NULL DEFAULT 'booking' CHECK (source IN ('booking', 'manual')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'following', 'in_progress', 'completed', 'paused')),
  progress_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.hsiangyun_members IS 'CRM 學員（由預約轉入或手動建立）';

-- ----------------------------------------
-- 3. 學員任務（任務板）hsiangyun_tasks
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.hsiangyun_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.hsiangyun_members(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.hsiangyun_tasks IS '學員任務／進度（任務板）';

-- ----------------------------------------
-- 4. 推播訊息 hsiangyun_push_messages
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.hsiangyun_push_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.hsiangyun_push_messages IS '推播訊息';

-- ----------------------------------------
-- 5. 媒體庫 hsiangyun_media
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.hsiangyun_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  alt text,
  usage text CHECK (usage IN ('hero', 'profile', 'petal', 'other')),
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.hsiangyun_media IS '媒體庫（圖片等，url 可為 Supabase Storage 路徑）';

-- ----------------------------------------
-- 6. 網站設定（主題等）hsiangyun_site_settings
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.hsiangyun_site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.hsiangyun_site_settings IS '網站設定（key 例如 theme，value 為 SiteTheme JSON）';

-- ----------------------------------------
-- 觸發器：自動更新 updated_at
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'hsiangyun_bookings_updated_at') THEN
    CREATE TRIGGER hsiangyun_bookings_updated_at
      BEFORE UPDATE ON public.hsiangyun_bookings
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'hsiangyun_members_updated_at') THEN
    CREATE TRIGGER hsiangyun_members_updated_at
      BEFORE UPDATE ON public.hsiangyun_members
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'hsiangyun_tasks_updated_at') THEN
    CREATE TRIGGER hsiangyun_tasks_updated_at
      BEFORE UPDATE ON public.hsiangyun_tasks
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'hsiangyun_push_messages_updated_at') THEN
    CREATE TRIGGER hsiangyun_push_messages_updated_at
      BEFORE UPDATE ON public.hsiangyun_push_messages
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END $$;


-- ----------------------------------------
-- RLS 啟用與政策
-- ----------------------------------------

-- 1. hsiangyun_bookings：匿名可新增（前台表單），已登入可讀寫（後台）
ALTER TABLE public.hsiangyun_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_bookings"
  ON public.hsiangyun_bookings FOR INSERT
  TO anon WITH CHECK (true);

CREATE POLICY "authenticated_all_bookings"
  ON public.hsiangyun_bookings FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- 2. hsiangyun_members：僅已登入（後台）可讀寫
ALTER TABLE public.hsiangyun_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_members"
  ON public.hsiangyun_members FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- 3. hsiangyun_tasks：僅已登入可讀寫
ALTER TABLE public.hsiangyun_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_tasks"
  ON public.hsiangyun_tasks FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- 4. hsiangyun_push_messages：僅已登入可讀寫
ALTER TABLE public.hsiangyun_push_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_push_messages"
  ON public.hsiangyun_push_messages FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- 5. hsiangyun_media：所有人可讀（前台顯示），僅已登入可寫
ALTER TABLE public.hsiangyun_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_media"
  ON public.hsiangyun_media FOR SELECT
  TO anon USING (true);

CREATE POLICY "authenticated_all_media"
  ON public.hsiangyun_media FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- 6. hsiangyun_site_settings：所有人可讀（主題），僅已登入可寫
ALTER TABLE public.hsiangyun_site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_site_settings"
  ON public.hsiangyun_site_settings FOR SELECT
  TO anon USING (true);

CREATE POLICY "authenticated_all_site_settings"
  ON public.hsiangyun_site_settings FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------
-- 可選：預設插入 theme 設定
-- ----------------------------------------
INSERT INTO public.hsiangyun_site_settings (key, value)
VALUES (
  'theme',
  '{"fontDisplay":"''Cormorant Garamond'', ''Noto Serif TC'', serif","fontBody":"''Noto Serif TC'', Georgia, serif","fontSizeBase":"1rem","fontSizeHeading":"1.25rem","colorBackground":"350 100% 97%","colorForeground":"10 14% 26%","colorPrimary":"35 52% 78%","colorSecondary":"350 60% 92%","colorAccent":"35 60% 72%"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
