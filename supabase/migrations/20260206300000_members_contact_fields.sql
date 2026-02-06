-- 學員聯絡欄位：方便聯絡時段、Line ID（選填）
ALTER TABLE public.hsiangyun_members
  ADD COLUMN IF NOT EXISTS preferred_contact_time text,
  ADD COLUMN IF NOT EXISTS line_id text;

COMMENT ON COLUMN public.hsiangyun_members.preferred_contact_time IS '方便聯絡時段（如週末上午、平日晚上）';
COMMENT ON COLUMN public.hsiangyun_members.line_id IS 'Line ID（選填，供一鍵複製或未來推播）';
