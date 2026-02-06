-- 學員標籤（分群用）+ 諮詢紀錄表
-- 1. 學員標籤：text[] 陣列，可存多個標籤如 產後、反覆減肥、朋友轉介
ALTER TABLE public.hsiangyun_members
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

COMMENT ON COLUMN public.hsiangyun_members.tags IS '學員標籤（分群、篩選用），如 產後、反覆減肥、朋友轉介';

-- 2. 諮詢紀錄表
CREATE TABLE IF NOT EXISTS public.hsiangyun_session_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.hsiangyun_members(id) ON DELETE CASCADE,
  note_date date NOT NULL DEFAULT current_date,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.hsiangyun_session_notes IS '諮詢紀錄（每次諮詢重點、下次目標）';

ALTER TABLE public.hsiangyun_session_notes ENABLE ROW LEVEL SECURITY;

-- anon 可讀寫（後台未登入時使用；啟用 Auth 後可改為僅 authenticated）
DROP POLICY IF EXISTS "anon_select_session_notes" ON public.hsiangyun_session_notes;
CREATE POLICY "anon_select_session_notes" ON public.hsiangyun_session_notes FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "anon_insert_session_notes" ON public.hsiangyun_session_notes;
CREATE POLICY "anon_insert_session_notes" ON public.hsiangyun_session_notes FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_session_notes" ON public.hsiangyun_session_notes;
CREATE POLICY "anon_update_session_notes" ON public.hsiangyun_session_notes FOR UPDATE TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_session_notes" ON public.hsiangyun_session_notes;
CREATE POLICY "anon_delete_session_notes" ON public.hsiangyun_session_notes FOR DELETE TO anon USING (true);
