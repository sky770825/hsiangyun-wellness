-- ============================================
-- Supabase RLS Policy 範本庫
-- ============================================
-- 使用方式：
-- 1. 複製對應情境的 policy
-- 2. 替換 {table_name} 為你的表名
-- 3. 在 Supabase SQL Editor 執行
-- ============================================

-- ============================================
-- 情境 1：只能讀寫自己的資料（最常用）
-- ============================================
-- 適用：user_profiles, todos, notes 等個人資料表

-- 1.1 啟用 RLS
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- 1.2 只能看自己的資料
CREATE POLICY "Users can view their own {table_name}"
ON {table_name}
FOR SELECT
USING (auth.uid() = user_id);

-- 1.3 只能新增自己的資料
CREATE POLICY "Users can insert their own {table_name}"
ON {table_name}
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 1.4 只能更新自己的資料
CREATE POLICY "Users can update their own {table_name}"
ON {table_name}
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 1.5 只能刪除自己的資料
CREATE POLICY "Users can delete their own {table_name}"
ON {table_name}
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 情境 2：公開讀取，私有寫入
-- ============================================
-- 適用：blog_posts, products, announcements

ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- 2.1 所有人都能讀
CREATE POLICY "Anyone can view {table_name}"
ON {table_name}
FOR SELECT
USING (true);

-- 2.2 只有擁有者能新增
CREATE POLICY "Only owners can insert {table_name}"
ON {table_name}
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2.3 只有擁有者能更新
CREATE POLICY "Only owners can update {table_name}"
ON {table_name}
FOR UPDATE
USING (auth.uid() = user_id);

-- 2.4 只有擁有者能刪除
CREATE POLICY "Only owners can delete {table_name}"
ON {table_name}
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 情境 3：管理員全權存取
-- ============================================
-- 適用：admin_logs, system_configs

ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- 3.1 建立 is_admin() 函式（只需執行一次）
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- 方法 A：檢查 auth.users metadata
  RETURN (
    SELECT raw_user_meta_data->>'role' = 'admin'
    FROM auth.users
    WHERE id = auth.uid()
  );
  
  -- 方法 B：檢查專用的 user_roles 表
  -- RETURN EXISTS (
  --   SELECT 1 FROM public.user_roles
  --   WHERE user_id = auth.uid() AND role = 'admin'
  -- );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.2 管理員能讀取所有資料
CREATE POLICY "Admins can view all {table_name}"
ON {table_name}
FOR SELECT
USING (is_admin());

-- 3.3 管理員能新增
CREATE POLICY "Admins can insert {table_name}"
ON {table_name}
FOR INSERT
WITH CHECK (is_admin());

-- 3.4 管理員能更新
CREATE POLICY "Admins can update {table_name}"
ON {table_name}
FOR UPDATE
USING (is_admin());

-- 3.5 管理員能刪除
CREATE POLICY "Admins can delete {table_name}"
ON {table_name}
FOR DELETE
USING (is_admin());

-- ============================================
-- 情境 4：團隊協作（多人共用）
-- ============================================
-- 適用：team_projects, shared_documents

ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- 4.1 建立 team_members 表（如果還沒有）
-- CREATE TABLE team_members (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   team_id uuid NOT NULL REFERENCES teams(id),
--   user_id uuid NOT NULL REFERENCES auth.users(id),
--   role text NOT NULL,
--   created_at timestamptz DEFAULT now()
-- );

-- 4.2 團隊成員能讀取團隊資料
CREATE POLICY "Team members can view {table_name}"
ON {table_name}
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = {table_name}.team_id
    AND team_members.user_id = auth.uid()
  )
);

-- 4.3 團隊成員能新增
CREATE POLICY "Team members can insert {table_name}"
ON {table_name}
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = {table_name}.team_id
    AND team_members.user_id = auth.uid()
  )
);

-- 4.4 團隊成員能更新
CREATE POLICY "Team members can update {table_name}"
ON {table_name}
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = {table_name}.team_id
    AND team_members.user_id = auth.uid()
  )
);

-- 4.5 只有團隊擁有者能刪除
CREATE POLICY "Team owners can delete {table_name}"
ON {table_name}
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = {table_name}.team_id
    AND team_members.user_id = auth.uid()
    AND team_members.role = 'owner'
  )
);

-- ============================================
-- 情境 5：階層式存取控制
-- ============================================
-- 適用：comments, posts 的回覆等巢狀結構

ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- 5.1 能看到自己的資料 + 公開的資料
CREATE POLICY "Users can view {table_name}"
ON {table_name}
FOR SELECT
USING (
  auth.uid() = user_id
  OR is_public = true
);

-- 5.2 只能新增自己的資料
CREATE POLICY "Users can insert {table_name}"
ON {table_name}
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5.3 只能更新自己的資料
CREATE POLICY "Users can update their {table_name}"
ON {table_name}
FOR UPDATE
USING (auth.uid() = user_id);

-- 5.4 只能刪除自己的資料
CREATE POLICY "Users can delete their {table_name}"
ON {table_name}
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 情境 6：時間限制存取
-- ============================================
-- 適用：限時活動、預約系統

ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active {table_name}"
ON {table_name}
FOR SELECT
USING (
  now() BETWEEN start_time AND end_time
  AND (auth.uid() = user_id OR is_public = true)
);

-- ============================================
-- 情境 7：Storage Bucket Policies
-- ============================================
-- 適用：檔案上傳、圖片儲存

-- 7.1 只能存取自己的檔案
CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 7.2 公開 bucket（所有人都能讀，只有擁有者能寫）
CREATE POLICY "Anyone can view public files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can upload to public"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'public'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- 檢查工具：驗證 RLS 是否正確設定
-- ============================================

-- 列出所有未啟用 RLS 的表（應該為空）
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT tablename
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename
  WHERE c.relrowsecurity = true
  AND t.schemaname = 'public'
)
ORDER BY tablename;

-- 列出所有表的 RLS 狀態
SELECT
  schemaname,
  tablename,
  CASE WHEN c.relrowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status,
  (
    SELECT count(*)
    FROM pg_policies
    WHERE schemaname = t.schemaname
    AND tablename = t.tablename
  ) as policy_count
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
ORDER BY rls_status, tablename;

-- ============================================
-- 常見錯誤排查
-- ============================================

-- 錯誤 1：RLS 啟用但沒有 policy → 所有查詢都回傳空
-- 解法：至少要有一個 FOR SELECT policy

-- 錯誤 2：auth.uid() 回傳 null
-- 檢查：SELECT auth.uid(); -- 應該回傳 user id
-- 如果是 null，代表沒有登入或 JWT 有問題

-- 錯誤 3：policy 用了 USING 但沒用 WITH CHECK
-- 解法：FOR INSERT 一定要有 WITH CHECK
--       FOR UPDATE 建議 USING 和 WITH CHECK 都加

-- 錯誤 4：is_admin() 函式沒有 SECURITY DEFINER
-- 解法：確保函式有 SECURITY DEFINER，否則 auth.uid() 可能抓不到

-- ============================================
-- 測試方法
-- ============================================

-- 1. 在 Supabase SQL Editor 測試
-- SET request.jwt.claims = '{"sub": "USER_ID_HERE"}';
-- SELECT * FROM {table_name}; -- 應該只看到該 user 的資料

-- 2. 在前端測試
-- const { data, error } = await supabase
--   .from('{table_name}')
--   .select('*');
-- console.log(data); // 應該只回傳當前登入者的資料
