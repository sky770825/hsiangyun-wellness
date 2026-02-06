-- 讓匿名可寫入媒體庫（後台未登入時可新增/更新/刪除）；正式啟用 Auth 後可改回僅 authenticated
DROP POLICY IF EXISTS "anon_insert_media" ON public.hsiangyun_media;
CREATE POLICY "anon_insert_media" ON public.hsiangyun_media FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_media" ON public.hsiangyun_media;
CREATE POLICY "anon_update_media" ON public.hsiangyun_media FOR UPDATE TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_media" ON public.hsiangyun_media;
CREATE POLICY "anon_delete_media" ON public.hsiangyun_media FOR DELETE TO anon USING (true);
