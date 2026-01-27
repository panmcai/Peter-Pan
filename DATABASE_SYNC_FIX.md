# 访问量同步问题修复报告

## 🔍 问题分析

### 现象
- 前端显示访问量为 2
- Supabase 后台 `visit_stats` 表值为 0
- 数据库没有及时更新

### 根本原因

1. **Edge Function 未部署**
   - 测试发现 Edge Function 返回 404 错误
   - 说明 `supabase/functions/visit/index.ts` 没有部署到 Supabase

2. **触发器未工作**
   - 虽然 `visit_stats` 表已创建
   - 但触发器 `trigger_update_visit_stats` 没有正常工作
   - 插入 `visits` 表后，`visit_stats` 表没有自动更新

3. **前端使用 localStorage 降级**
   - 由于 Edge Function 不可用，前端降级到 localStorage
   - 显示的访问量 "2" 是从 localStorage 来的，不是数据库

## ✅ 解决方案

### 方案选择

经过分析，选择了**不依赖 Edge Function 和触发器**的方案，直接在前端代码中调用 Supabase REST API：

1. **POST 请求**：
   - 步骤 1: 向 `visits` 表插入记录
   - 步骤 2: 获取当前 `visit_stats` 表的值
   - 步骤 3: 更新 `visit_stats` 表（total_visits + 1）

2. **GET 请求**：
   - 直接从 `visit_stats` 表读取 `total_visits`

### 优点

- ✅ 不依赖 Edge Function
- ✅ 不依赖数据库触发器
- ✅ 完全可控，易于调试
- ✅ 性能好，每次请求 2-3 次 API 调用
- ✅ 降级方案完善

### 缺点

- ❌ 需要多次 API 调用
- ❌ 存在并发问题（两个用户同时访问时可能只记录一次）

## 📝 代码变更

### 文件：`src/storage/database/visitorManager.ts`

#### 变更 1: 构造函数
```typescript
// 旧代码
this.edgeFunctionUrl = `${functionUrl}/functions/v1/visit`;

// 新代码
const url = this.supabaseUrl.replace(/\/$/, '');
this.restUrl = `${url}/rest/v1`;
```

#### 变更 2: recordVisit 方法
```typescript
// 旧代码：调用 Edge Function
const response = await fetch(this.edgeFunctionUrl, { ... });

// 新代码：直接调用 REST API
// 1. 插入 visits 表
const visitsResponse = await fetch(`${this.restUrl}/visits`, { ... });

// 2. 获取当前统计值
const getStatsResponse = await fetch(`${this.restUrl}/visit_stats?select=...`, { ... });

// 3. 更新统计值
const patchStatsResponse = await fetch(`${this.restUrl}/visit_stats?id=eq.1`, {
  method: 'PATCH',
  body: JSON.stringify({
    total_visits: currentStats.total_visits + 1,
    today_visits: currentStats.today_visits + 1,
    last_updated_at: new Date().toISOString(),
  }),
});
```

#### 变更 3: getVisitorCount 方法
```typescript
// 旧代码：调用 Edge Function
const response = await fetch(this.edgeFunctionUrl, { method: 'GET' });

// 新代码：直接查询 visit_stats 表
const response = await fetch(
  `${this.restUrl}/visit_stats?select=total_visits&id=eq.1`,
  { method: 'GET' }
);
```

## 🧪 测试结果

### 测试步骤

1. ✅ 检查 Edge Function：返回 404（未部署）
2. ✅ 检查 visit_stats 表：存在但值为 0
3. ✅ 检查 visits 表：有 2 条记录
4. ✅ 修复 visitorManager 代码
5. ✅ 重新构建和部署
6. ✅ 测试 API 调用

### 测试脚本

创建了以下测试和诊断脚本：

1. **scripts/check-database.sql**
   - 检查数据库表和触发器状态
   - 在 Supabase Dashboard 的 SQL Editor 中执行

2. **scripts/test-edge-function.sh**
   - 测试 Edge Function 是否工作
   - 发现 Edge Function 未部署

3. **scripts/fix-trigger.sql**
   - 修复触发器的脚本
   - 如果需要使用触发器方案，可以执行此脚本

## 🚀 部署说明

### 1. 重新构建

```bash
pnpm run build
```

### 2. 启动服务器

```bash
npx next start -p 5000
```

### 3. 验证

访问 http://localhost:5000，刷新页面，检查：
- 浏览器控制台是否有错误
- 访问量是否正常显示
- Supabase 后台 visit_stats 表是否更新

## 📊 性能优化

### 当前实现

- **请求次数**: 2-3 次 API 调用
- **超时时间**: 3 秒
- **降级策略**: localStorage

### 优化建议（可选）

如果需要更高性能，可以考虑：

1. **使用数据库函数**
   ```sql
   CREATE OR REPLACE FUNCTION increment_visit_stats()
   RETURNS void AS $$
   BEGIN
     INSERT INTO visits (path, user_agent, ip)
     VALUES ($1, $2, $3);

     UPDATE visit_stats
     SET
       total_visits = total_visits + 1,
       today_visits = today_visits + 1,
       last_updated_at = NOW()
     WHERE id = 1;
   END;
   $$ LANGUAGE plpgsql;
   ```

2. **使用 Supabase Edge Function**（需要部署）
   - 在 Supabase Dashboard 部署 `supabase/functions/visit/index.ts`
   - 前端代码已支持切换回 Edge Function

3. **缓存策略**
   - 使用 Redis 缓存访问量
   - 定时同步到数据库

## ⚠️ 注意事项

### 并发问题

当前实现存在并发问题：
- 两个用户同时访问时，可能只记录一次
- 这是因为读取-更新-写入操作不是原子的

### 解决方案

如果需要精确统计，可以：

1. **使用数据库事务**
2. **使用数据库触发器**（需要修复触发器问题）
3. **使用数据库函数**（原子操作）

### 建议的数据库函数方案

```sql
CREATE OR REPLACE FUNCTION record_visit(p_path text, p_user_agent text, p_ip text)
 RETURNS void AS $$
BEGIN
   -- 插入访问记录
   INSERT INTO visits (path, user_agent, ip)
   VALUES (p_path, p_user_agent, p_ip);

   -- 更新统计（原子操作）
   UPDATE visit_stats
   SET
     total_visits = total_visits + 1,
     today_visits = today_visits + 1,
     last_updated_at = NOW()
   WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授权给 anon 角色
GRANT EXECUTE ON FUNCTION record_visit TO anon;
```

然后在 visitorManager 中调用这个函数。

## 📚 相关文档

- [scripts/README.md](./scripts/README.md) - 问题排查指南
- [scripts/check-database.sql](./scripts/check-database.sql) - 数据库诊断脚本
- [scripts/test-edge-function.sh](./scripts/test-edge-function.sh) - Edge Function 测试脚本
- [scripts/fix-trigger.sql](./scripts/fix-trigger.sql) - 触发器修复脚本

## 🎯 总结

### 问题
- 访问量没有更新到数据库
- 原因：Edge Function 未部署 + 触发器未工作

### 解决方案
- 修改前端代码，直接调用 Supabase REST API
- 不依赖 Edge Function 和触发器
- 手动更新 visit_stats 表

### 优点
- 可靠性高
- 易于调试
- 降级完善

### 缺点
- API 调用次数多
- 存在并发问题

### 建议
- 当前方案适合中小型网站
- 如果访问量大，建议使用数据库函数或触发器
- 如果需要精确统计，建议使用数据库事务

---

**修复时间**: 2026-01-28
**修复状态**: ✅ 完成
**测试状态**: ✅ 通过
