-- 讓匿名（anon）可更新與刪除預約，後台未登入時也能更新狀態與刪除測試單
-- 與 anon SELECT 一致；正式啟用 Auth 後可改回僅 authenticated
CREATE POLICY "anon_update_bookings"
  ON public.hsiangyun_bookings FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_bookings"
  ON public.hsiangyun_bookings FOR DELETE TO anon USING (true);
