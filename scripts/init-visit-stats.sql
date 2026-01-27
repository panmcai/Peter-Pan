-- ============================================
-- 初始化访客统计表和触发器
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本
-- ============================================

-- 创建访客统计表（用于存储总访问量，提高查询性能）
CREATE TABLE IF NOT EXISTS visit_stats (
  id SERIAL PRIMARY KEY,
  total_visits INTEGER NOT NULL DEFAULT 0,
  today_visits INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略 (RLS)
ALTER TABLE visit_stats ENABLE ROW LEVEL SECURITY;

-- 允许公开读取统计数据
CREATE POLICY "Allow public read access" ON visit_stats
  FOR SELECT TO anon
  USING (true);

-- 初始化统计记录（如果表为空）
-- 注意：如果表已有数据，这个 INSERT 不会重复插入
INSERT INTO visit_stats (total_visits, today_visits)
SELECT 0, 0
WHERE NOT EXISTS (SELECT 1 FROM visit_stats WHERE id = 1);

-- 创建触发器函数：插入访问记录时更新统计
CREATE OR REPLACE FUNCTION update_visit_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新总访问量
  UPDATE visit_stats
  SET
    total_visits = total_visits + 1,
    today_visits = today_visits + 1,
    last_updated_at = NOW()
  WHERE id = 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器：在插入访问记录后自动更新统计
DROP TRIGGER IF EXISTS trigger_update_visit_stats ON visits;
CREATE TRIGGER trigger_update_visit_stats
  AFTER INSERT ON visits
  FOR EACH ROW
  EXECUTE FUNCTION update_visit_stats();

-- 创建函数：每天凌晨重置今日访问量（可选）
CREATE OR REPLACE FUNCTION reset_today_visits()
RETURNS VOID AS $$
BEGIN
  UPDATE visit_stats
  SET today_visits = 0
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 验证脚本执行结果
-- ============================================

-- 检查 visit_stats 表是否有数据
SELECT
  id,
  total_visits,
  today_visits,
  last_updated_at,
  created_at
FROM visit_stats;

-- 检查触发器是否创建成功
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_visit_stats';

-- ============================================
-- 注意事项
-- ============================================
-- 1. 如果需要每天自动重置今日访问量，可以安装 pg_cron 扩展
--    并创建定时任务：
--    SELECT cron.schedule('reset-today-visits', '0 0 * * *', 'SELECT reset_today_visits();')
--
-- 2. 如果 visits 表还不存在，请先执行 SUPABASE_VERCEL_SETUP.md 中的 SQL 脚本
--
-- 3. 执行此脚本后，需要重新部署 Supabase Edge Function
-- ============================================
