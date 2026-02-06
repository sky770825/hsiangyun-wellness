-- 讓匿名（anon）可讀取預約表，後台未登入時也能顯示預約列表
-- 與學員、任務的 anon SELECT 一致；正式啟用 Auth 後可改回僅 authenticated
DROP POLICY IF EXISTS "anon_select_bookings" ON public.hsiangyun_bookings;
CREATE POLICY "anon_select_bookings" ON public.hsiangyun_bookings FOR SELECT TO anon USING (true);
