# 优化实施快速清单

## ✅ 优化实施检查清单

### 步骤 1: 创建数据库函数 ⏳

- [ ] 访问 https://supabase.com/dashboard
- [ ] 进入项目（dhmoxklldcaztujuefsw）
- [ ] 点击左侧菜单 "SQL Editor"
- [ ] 点击 "New Query"
- [ ] 复制 `scripts/optimize-visit-functions.sql` 的内容
- [ ] 粘贴到编辑器
- [ ] 点击 "RUN" 执行

### 步骤 2: 验证函数创建 ⏳

执行以下 SQL 验证函数是否创建成功：

```sql
SELECT
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'record_visit',
    'get_visit_count',
    'get_visit_stats'
  );
```

**预期结果**: 3 行记录

### 步骤 3: 测试函数 ⏳

```bash
./scripts/test-db-functions.sh
```

**预期结果**:
- ✅ 所有测试通过
- ✅ 访问量正确更新
- ✅ 性能测试完成

### 步骤 4: 重新构建 ✅

```bash
pnpm run build
```

**预期结果**:
- ✅ 编译成功
- ✅ 无类型错误

### 步骤 5: 重启服务器 ⏳

```bash
pkill -f "next start"
nohup npx next start -p 5000 > /app/work/logs/bypass/prod.log 2>&1 &
```

### 步骤 6: 验证效果 ⏳

访问 http://localhost:5000

检查项：
- [ ] 页面正常加载
- [ ] 访问量正常显示
- [ ] 浏览器控制台无错误
- [ ] Supabase 后台 visit_stats 表正确更新

---

## 🚀 一键执行脚本

如果你想要自动化执行所有步骤，可以使用以下脚本：

```bash
#!/bin/bash
# 一键优化部署脚本

echo "🚀 开始优化部署..."

# 1. 构建
echo "📦 构建生产版本..."
pnpm run build

if [ $? -ne 0 ]; then
  echo "❌ 构建失败"
  exit 1
fi

# 2. 重启服务
echo "🔄 重启服务..."
pkill -f "next start"
sleep 2
nohup npx next start -p 5000 > /app/work/logs/bypass/prod.log 2>&1 &

sleep 3

# 3. 检查服务
echo "🔍 检查服务状态..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200"; then
  echo "✅ 服务启动成功"
else
  echo "❌ 服务启动失败"
  exit 1
fi

echo "✅ 优化部署完成！"
echo ""
echo "⚠️  重要提示："
echo "1. 请在 Supabase Dashboard 执行 scripts/optimize-visit-functions.sql"
echo "2. 执行完成后运行 ./scripts/test-db-functions.sh 测试"
echo "3. 访问 http://localhost:5000 验证效果"
```

保存为 `scripts/deploy-optimization.sh`，然后执行：

```bash
chmod +x scripts/deploy-optimization.sh
./scripts/deploy-optimization.sh
```

---

## 📊 预期效果

优化完成后，你应该看到：

| 指标 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| **API 调用次数** | 3 次 | 1 次 | ⬇️ 67% |
| **响应时间** | ~300ms | ~100ms | ⬇️ 67% |
| **并发安全** | ❌ | ✅ | ✅ |
| **代码复杂度** | 高 | 低 | ✅ |

---

## 🔧 故障排查

### 问题 1: 函数调用失败

**症状**: HTTP 404 或 500 错误

**解决方案**:
1. 检查 SQL 脚本是否正确执行
2. 检查函数权限是否正确配置
3. 查看浏览器控制台错误信息

### 问题 2: 访问量未更新

**症状**: 页面显示的值不变化

**解决方案**:
1. 清除浏览器 localStorage
2. 检查 Supabase 后台 visit_stats 表
3. 运行测试脚本验证

### 问题 3: 性能没有提升

**症状**: 响应时间仍然很慢

**解决方案**:
1. 检查网络延迟
2. 检查 Supabase 服务状态
3. 增加超时时间

---

## 📚 相关文档

- **OPTIMIZATION_GUIDE.md** - 详细优化指南
- **DATABASE_SYNC_FIX.md** - 之前的修复报告
- **scripts/optimize-visit-functions.sql** - 数据库函数脚本
- **scripts/test-db-functions.sh** - 测试脚本

---

**当前状态**: 代码已优化，等待执行 SQL 脚本
**下一步**: 在 Supabase Dashboard 执行 `scripts/optimize-visit-functions.sql`
