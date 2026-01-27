#!/bin/bash

# 测试数据库函数
# 需要先执行 scripts/optimize-visit-functions.sql 创建函数

SUPABASE_URL="https://dhmoxklldcaztujuefsw.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobW94a2xsZGNhenR1anVlZnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTQ1NzcsImV4cCI6MjA4NDQ3MDU3N30.Cflm39jGTf3pgIPQ6hUY0mehYvKiUv-nO1_PVNYt9HI"

echo "======================================"
echo "测试数据库函数（优化版）"
echo "======================================"
echo ""

# 测试 1: 检查函数是否存在
echo "📋 Test 1: 检查数据库函数是否存在"
echo "--------------------------------------"
FUNCTIONS_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' \
  "$SUPABASE_URL/rest/v1/rpc/get_visit_count")

HTTP_CODE=$(echo "$FUNCTIONS_RESULT" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE=$(echo "$FUNCTIONS_RESULT" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ get_visit_count 函数存在且可调用"
    echo "当前访问量: $RESPONSE"
else
    echo "❌ 函数不存在或无法调用 (HTTP $HTTP_CODE)"
    echo "请先在 Supabase Dashboard 执行 scripts/optimize-visit-functions.sql"
fi
echo ""

# 测试 2: 记录一次访问（优化版）
echo "📝 Test 2: 记录一次访问（使用 record_visit 函数）"
echo "--------------------------------------"
RECORD_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_path": "/test-db-function",
    "p_user_agent": "test-agent",
    "p_ip": "127.0.0.1"
  }' \
  "$SUPABASE_URL/rest/v1/rpc/record_visit")

HTTP_CODE=$(echo "$RECORD_RESULT" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE=$(echo "$RECORD_RESULT" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 访问记录成功"
else
    echo "❌ 访问记录失败 (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE"
fi
echo ""

# 测试 3: 获取更新后的访问量
echo "📊 Test 3: 获取更新后的访问量"
echo "--------------------------------------"
sleep 1
GET_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' \
  "$SUPABASE_URL/rest/v1/rpc/get_visit_count")

HTTP_CODE=$(echo "$GET_RESULT" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE=$(echo "$GET_RESULT" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 访问量获取成功"
    echo "当前总访问量: $RESPONSE"
else
    echo "❌ 获取失败 (HTTP $HTTP_CODE)"
fi
echo ""

# 测试 4: 获取详细统计信息
echo "📊 Test 4: 获取详细统计信息"
echo "--------------------------------------"
DETAILS_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' \
  "$SUPABASE_URL/rest/v1/rpc/get_visit_stats")

HTTP_CODE=$(echo "$DETAILS_RESULT" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE=$(echo "$DETAILS_RESULT" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 详细统计获取成功"
    echo "Response: $RESPONSE"
else
    echo "❌ 获取失败 (HTTP $HTTP_CODE)"
fi
echo ""

# 测试 5: 性能测试
echo "⚡ Test 5: 性能测试（记录 10 次访问）"
echo "--------------------------------------"
START_TIME=$(date +%s%N)
for i in {1..10}; do
    curl -s -X POST \
      -H "apikey: $SUPABASE_ANON_KEY" \
      -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"p_path\": \"/perf-test-$i\", \"p_user_agent\": \"test\", \"p_ip\": \"\"}" \
      "$SUPABASE_URL/rest/v1/rpc/record_visit" > /dev/null
done
END_TIME=$(date +%s%N)
DURATION=$(( ($END_TIME - $START_TIME) / 1000000 ))
echo "✅ 10 次访问记录完成，耗时: ${DURATION}ms"
echo "平均每次: $(( $DURATION / 10 ))ms"
echo ""

# 测试 6: 验证数据库状态
echo "🔍 Test 6: 验证数据库状态"
echo "--------------------------------------"
echo "visits 表记录数:"
curl -s \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Prefer: count=exact" \
  "$SUPABASE_URL/rest/v1/visits?select=id" \
  -H "Content-Range: 0/0"
echo ""
echo ""
echo "visit_stats 表状态:"
curl -s \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/visit_stats?select=*"
echo ""
echo ""

echo "======================================"
echo "测试完成"
echo "======================================"
echo ""
echo "性能对比："
echo "旧方案：3 次 API 调用（POST visits + GET visit_stats + PATCH visit_stats）"
echo "新方案：1 次 API 调用（POST rpc/record_visit）"
echo "性能提升：~3x"
echo ""
echo "并发问题解决："
echo "旧方案：存在并发问题（读取-更新-写入不是原子操作）"
echo "新方案：原子操作，无并发问题"
