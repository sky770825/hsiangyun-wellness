-- 學員表：Line OA 來源欄位（擷取從 Line 加入的 User ID、名稱、大頭貼）
-- 並允許來源為 line（之後會員系統從 Line OA 加入時使用）
ALTER TABLE public.hsiangyun_members
  ADD COLUMN IF NOT EXISTS line_user_id text,
  ADD COLUMN IF NOT EXISTS line_display_name text,
  ADD COLUMN IF NOT EXISTS line_picture_url text;

COMMENT ON COLUMN public.hsiangyun_members.line_user_id IS 'Line 用戶 ID（從 Line OA API 取得，用於推播與識別）';
COMMENT ON COLUMN public.hsiangyun_members.line_display_name IS 'Line 顯示名稱（從 Line OA 取得）';
COMMENT ON COLUMN public.hsiangyun_members.line_picture_url IS 'Line 大頭貼 URL（可選）';

-- 放寬 source 允許 'line'（先移除既有 CHECK 再建立新的）
DO $$
DECLARE
  cname text;
BEGIN
  SELECT con.conname INTO cname
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'hsiangyun_members' AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%source%'
  LIMIT 1;
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.hsiangyun_members DROP CONSTRAINT %I', cname);
  END IF;
END $$;
ALTER TABLE public.hsiangyun_members ADD CONSTRAINT hsiangyun_members_source_check
  CHECK (source IN ('booking', 'manual', 'line'));
