-- 預約表新增電話欄位（前台預約表單「聯絡電話」選填）
ALTER TABLE public.hsiangyun_bookings
  ADD COLUMN IF NOT EXISTS phone text;

COMMENT ON COLUMN public.hsiangyun_bookings.phone IS '預約聯絡電話（選填）';
