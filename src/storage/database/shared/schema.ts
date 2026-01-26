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
