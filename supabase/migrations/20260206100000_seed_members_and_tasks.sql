-- ============================================
-- 種子資料：5 位學員 + 相關任務 + 預約（模擬真實後台）
-- ============================================
-- 說明：為讓後台未登入時也能顯示種子資料（展示用），
-- 暫時允許 anon 對 members / tasks 做 SELECT。正式上線建議改為僅 authenticated。
-- ============================================

-- 允許 anon 讀取學員與任務（展示用，可於啟用 Auth 後刪除此 policy）
DROP POLICY IF EXISTS "anon_select_members" ON public.hsiangyun_members;
CREATE POLICY "anon_select_members" ON public.hsiangyun_members FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "anon_select_tasks" ON public.hsiangyun_tasks;
CREATE POLICY "anon_select_tasks" ON public.hsiangyun_tasks FOR SELECT TO anon USING (true);

-- 學員（固定 UUID 以便任務可引用）
INSERT INTO public.hsiangyun_members (id, name, email, phone, source, status, progress_note, created_at, updated_at) VALUES
  ('a1000001-0001-4000-8000-000000000001', '王美玲', 'meiling.wang@example.com', '0912-345-678', 'booking', 'in_progress', '產後八個月，想調整飲食與心態，目前每週一次諮詢。希望三個月內建立穩定習慣。', now() - interval '45 days', now()),
  ('a1000001-0001-4000-8000-000000000002', '陳雅婷', 'yating.chen@example.com', '0923-456-789', 'booking', 'following', '反覆復胖多次，對體重數字很焦慮。已填寫初談表單，待安排第一次見面。', now() - interval '12 days', now()),
  ('a1000001-0001-4000-8000-000000000003', '林曉慧', 'xiaohui.lin@example.com', NULL, 'manual', 'new', '朋友轉介，對心靈減脂有興趣，尚未開始。', now() - interval '3 days', now()),
  ('a1000001-0001-4000-8000-000000000004', '張雅琪', 'yaqi.zhang@example.com', '0934-567-890', 'booking', 'completed', '已完成 12 週陪伴，體重與情緒都有改善，目前維持中。', now() - interval '120 days', now()),
  ('a1000001-0001-4000-8000-000000000005', '黃淑芬', 'shufen.huang@example.com', '0945-678-901', 'booking', 'paused', '工作壓力大暫停兩週，預計下月恢復。備註：偏好週末時段。', now() - interval '60 days', now())
ON CONFLICT (id) DO NOTHING;

-- 學員任務（連結到上述學員）
INSERT INTO public.hsiangyun_tasks (student_id, title, description, status, due_date) VALUES
  ('a1000001-0001-4000-8000-000000000001', '填寫一週飲食紀錄', '請學員在表單中填寫 7 天飲食與情緒簡述', 'done', (current_date - interval '30 days')),
  ('a1000001-0001-4000-8000-000000000001', '第二次諮詢準備', '確認本週目標：減少宵夜頻率、增加步行', 'in_progress', current_date + 2),
  ('a1000001-0001-4000-8000-000000000001', '月底回顧與下月計畫', '檢視本月進度並設定下月小目標', 'todo', (current_date + interval '1 month')),
  ('a1000001-0001-4000-8000-000000000002', '寄送初談表單連結', '已寄出，等待學員回填', 'done', (current_date - 5)),
  ('a1000001-0001-4000-8000-000000000002', '安排首次諮詢時間', '學員偏好平日晚上或週六上午', 'todo', current_date + 7),
  ('a1000001-0001-4000-8000-000000000003', '電話初步關懷', '確認需求與可配合時段', 'todo', current_date + 3),
  ('a1000001-0001-4000-8000-000000000004', '季度追蹤問卷', '完成後可歸檔為長期維持案例', 'done', (current_date - 10)),
  ('a1000001-0001-4000-8000-000000000005', '確認恢復諮詢意願', '下月初前聯繫一次', 'todo', (current_date + interval '1 month'))
;

-- 預約（2 筆模擬前台表單提交）
INSERT INTO public.hsiangyun_bookings (name, email, message, status) VALUES
  ('吳小華', 'xiaohua.wu@example.com', '想了解產後瘦身與心靈減脂的流程，希望可以約週末。', 'pending'),
  ('鄭雅文', 'yawen.zheng@example.com', '已經反覆減肥很多次，想換一種方式，先預約看看。', 'contacted')
;
