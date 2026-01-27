#!/bin/bash

# 测试 Supabase Edge Function
# 需要设置环境变量或直接在脚本中填写

# Supabase 配置
SUPABASE_URL="https://dhmoxklldcaztujuefsw.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobW94a2xsZGNhenR1anVlZnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTQ1NzcsImV4cCI6MjA4NDQ3MDU3N30.Cflm39jGTf3pgIPQ6hUY0mehYvKiUv-nO1_PVNYt9HI"

echo "======================================"
echo "Testing Supabase Edge Function"
echo "======================================"
echo ""

# 测试 1: GET 请求 - 获取总访问量
echo "📊 Test 1: GET /functions/v1/visit (Get total visits)"
echo "--------------------------------------"
GET_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X GET \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/functions/v1/visit")

HTTP_CODE=$(echo "$GET_RESULT" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE=$(echo "$GET_RESULT" | grep -v "HTTP_CODE")

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE"
echo ""

# 测试 2: POST 请求 - 记录一次访问
echo "📝 Test 2: POST /functions/v1/visit (Record visit)"
echo "--------------------------------------"
POST_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"path":"/test"}' \
  "$SUPABASE_URL/functions/v1/visit")

HTTP_CODE=$(echo "$POST_RESULT" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE=$(echo "$POST_RESULT" | grep -v "HTTP_CODE")

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE"
echo ""

# 测试 3: 再次 GET 请求 - 验证访问量是否增加
echo "📊 Test 3: GET /functions/v1/visit (Verify count increased)"
echo "--------------------------------------"
sleep 1  # 等待触发器执行
GET_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X GET \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/functions/v1/visit")

HTTP_CODE=$(echo "$GET_RESULT" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE=$(echo "$GET_RESULT" | grep -v "HTTP_CODE")

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE"
echo ""

# 测试 4: 直接查询 visit_stats 表
echo "📊 Test 4: Direct query visit_stats table"
echo "--------------------------------------"
DIRECT_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X GET \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/visit_stats?select=*")

HTTP_CODE=$(echo "$DIRECT_RESULT" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE=$(echo "$DIRECT_RESULT" | grep -v "HTTP_CODE")

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE"
echo ""

# 测试 5: 直接查询 visits 表（记录数）
echo "📊 Test 5: Direct query visits table (count)"
echo "--------------------------------------"
VISITS_COUNT=$(curl -s \
  -X GET \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Prefer: count=exact" \
  "$SUPABASE_URL/rest/v1/visits?select=id" \
  -H "Content-Range: 0/0")

echo "Response: $VISITS_COUNT"
echo ""

echo "======================================"
echo "Test Completed"
echo "======================================"
echo ""
echo "诊断建议："
echo "1. 如果 Edge Function 返回 404，说明函数未部署"
echo "2. 如果 visit_stats 返回 0 但 visits 有记录，说明触发器未工作"
echo "3. 如果所有查询都失败，检查 API Key 是否正确"
echo ""
echo "请查看 scripts/check-database.sql 获取数据库状态诊断"
