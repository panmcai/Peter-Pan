/**
 * 数据库 Schema 定义
 * 用于 Supabase PostgreSQL 数据库
 */

/**
 * 访客记录表 (visits)
 */
export interface Visit {
  id?: number;
  path: string;
  user_agent?: string;
  ip?: string;
  created_at?: string;
}

/**
 * 访客统计表 (visit_stats)
 * 用于存储统计信息，避免每次都执行 COUNT(*)
 */
export interface VisitStats {
  id?: number;
  total_visits: number;
  today_visits: number;
  last_updated_at: string;
}

/**
 * 数据库表结构 SQL (用于在 Supabase Dashboard 中执行)
 */
export const CREATE_VISITS_TABLE_SQL = `
-- 创建访客记录表
CREATE TABLE IF NOT EXISTS visits (
  id BIGSERIAL PRIMARY KEY,
  path VARCHAR(255) NOT NULL DEFAULT '/',
  user_agent TEXT,
  ip VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_path ON visits(path);

-- 启用行级安全策略 (RLS)
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 允许公开读取
CREATE POLICY "Allow public read access" ON visits
  FOR SELECT TO anon
  USING (true);

-- 允许公开插入（记录访问）
CREATE POLICY "Allow public insert access" ON visits
  FOR INSERT TO anon
  WITH CHECK (true);
`;

/**
 * 创建访客统计表和触发器
 */
export const CREATE_VISIT_STATS_SQL = `
-- 创建访客统计表
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
INSERT INTO visit_stats (total_visits, today_visits)
SELECT 0, 0
WHERE NOT EXISTS (SELECT 1 FROM visit_stats);

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

-- 创建函数：每天凌晨重置今日访问量
CREATE OR REPLACE FUNCTION reset_today_visits()
RETURNS VOID AS $$
BEGIN
  UPDATE visit_stats
  SET today_visits = 0
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- 注意：可以通过 pg_cron 或其他调度工具每天凌晨调用 reset_today_visits()
-- 例如：SELECT cron.schedule('reset-today-visits', '0 0 * * *', 'SELECT reset_today_visits();')
`;
