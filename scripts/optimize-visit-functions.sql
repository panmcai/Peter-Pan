-- ============================================
-- 访问量统计优化 - 数据库函数方案
-- 在 Supabase Dashboard 的 SQL Editor 中执行
-- ============================================

-- 1. 创建记录访问的函数（原子操作）
-- 这个函数会在单个事务中完成插入和更新，避免并发问题
CREATE OR REPLACE FUNCTION record_visit(
  p_path VARCHAR(255),
  p_user_agent TEXT,
  p_ip VARCHAR(45)
) RETURNS void AS $$
BEGIN
  -- 步骤 1: 插入访问记录
  INSERT INTO visits (path, user_agent, ip)
  VALUES (
    COALESCE(p_path, '/'),
    COALESCE(p_user_agent, ''),
    COALESCE(p_ip, '')
  );

  -- 步骤 2: 更新统计（原子操作）
  UPDATE visit_stats
  SET
    total_visits = total_visits + 1,
    today_visits = today_visits + 1,
    last_updated_at = NOW()
  WHERE id = 1;

  -- 如果 visit_stats 表为空，初始化一条记录
  IF NOT FOUND THEN
    INSERT INTO visit_stats (total_visits, today_visits, last_updated_at)
    VALUES (1, 1, NOW());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 授权给 anon 角色（允许匿名访问）
GRANT EXECUTE ON FUNCTION record_visit TO anon;

-- 3. 创建获取访问量的函数
CREATE OR REPLACE FUNCTION get_visit_count()
 RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- 获取总访问量
  SELECT total_visits INTO v_count FROM visit_stats WHERE id = 1;

  -- 如果没有记录，返回 0
  IF v_count IS NULL THEN
    RETURN 0;
  END IF;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 授权给 anon 角色
GRANT EXECUTE ON FUNCTION get_visit_count TO anon;

-- 5. 创建批量获取统计信息的函数
CREATE OR REPLACE FUNCTION get_visit_stats()
 RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_visits', COALESCE(total_visits, 0),
    'today_visits', COALESCE(today_visits, 0),
    'last_updated_at', last_updated_at
  ) INTO v_stats
  FROM visit_stats
  WHERE id = 1;

  -- 如果没有记录，返回初始值
  IF v_stats IS NULL THEN
    SELECT json_build_object(
      'total_visits', 0,
      'today_visits', 0,
      'last_updated_at', NOW()
    ) INTO v_stats;
  END IF;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 授权给 anon 角色
GRANT EXECUTE ON FUNCTION get_visit_stats TO anon;

-- 7. 创建重置今日访问量的函数
CREATE OR REPLACE FUNCTION reset_today_visits()
 RETURNS void AS $$
BEGIN
  UPDATE visit_stats
  SET today_visits = 0,
      last_updated_at = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 授权给 anon 角色（如果需要定时任务调用）
-- GRANT EXECUTE ON FUNCTION reset_today_visits TO anon;

-- ============================================
-- 验证函数是否创建成功
-- ============================================

-- 9. 显示所有创建的函数
SELECT
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'record_visit',
    'get_visit_count',
    'get_visit_stats',
    'reset_today_visits'
  );

-- ============================================
-- 测试函数
-- ============================================

-- 10. 测试 record_visit 函数
SELECT record_visit('/test-function', 'test-agent', '127.0.0.1');

-- 11. 测试 get_visit_count 函数
SELECT get_visit_count() as total_visits;

-- 12. 测试 get_visit_stats 函数
SELECT get_visit_stats() as visit_stats;

-- 13. 验证数据库表是否正确更新
SELECT
  'visits count' as table_name,
  COUNT(*) as record_count
FROM visits
UNION ALL
SELECT
  'visit_stats.total_visits' as table_name,
  total_visits::TEXT as record_count
FROM visit_stats
WHERE id = 1;

-- ============================================
-- 性能对比测试（可选）
-- ============================================

-- 14. 创建测试数据的函数（用于性能测试）
CREATE OR REPLACE FUNCTION test_concurrent_visits(p_count INTEGER)
 RETURNS void AS $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..p_count LOOP
    PERFORM record_visit('/concurrent-test', 'test-agent', '127.0.0.1');
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION test_concurrent_visits TO anon;

-- 15. 清理测试数据的函数
CREATE OR REPLACE FUNCTION cleanup_test_visits()
 RETURNS void AS $$
BEGIN
  -- 删除测试记录
  DELETE FROM visits WHERE path LIKE '%test%';

  -- 重置统计（可选）
  -- UPDATE visit_stats SET total_visits = 0 WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION cleanup_test_visits TO anon;

-- ============================================
-- 使用说明
-- ============================================

/*
在代码中调用这些函数：

1. 记录访问：
   POST /rest/v1/rpc/record_visit
   Body: {
     "p_path": "/",
     "p_user_agent": "Mozilla/5.0...",
     "p_ip": "127.0.0.1"
   }

2. 获取访问量：
   POST /rest/v1/rpc/get_visit_count

3. 获取详细信息：
   POST /rest/v1/rpc/get_visit_stats

4. 重置今日访问量：
   POST /rest/v1/rpc/reset_today_visits

性能对比：

旧方案（3 次 API 调用）：
- POST /rest/v1/visits
- GET /rest/v1/visit_stats
- PATCH /rest/v1/visit_stats

新方案（1 次 API 调用）：
- POST /rest/v1/rpc/record_visit

性能提升：~3x

并发问题解决：
- 旧方案：存在并发问题（读取-更新-写入不是原子操作）
- 新方案：原子操作，无并发问题
*/
