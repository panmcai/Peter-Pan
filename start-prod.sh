#!/bin/bash

# Peter·Pan 个人网站 - 生产环境启动脚本

echo "🚀 Starting Peter·Pan website in production mode..."

# 检查是否已构建
if [ ! -d ".next" ]; then
    echo "📦 Build directory not found. Running production build..."
    pnpm run build
fi

# 检查端口是否被占用
if ss -tuln 2>/dev/null | grep -q ":5000.*LISTEN"; then
    echo "⚠️  Port 5000 is already in use. Stopping existing process..."
    pkill -f "next start"
    sleep 2
fi

# 启动生产服务器
echo "🌐 Starting production server on port 5000..."
nohup npx next start -p 5000 > /app/work/logs/bypass/prod.log 2>&1 &

# 等待服务器启动
sleep 3

# 检查服务器状态
if ss -tuln 2>/dev/null | grep -q ":5000.*LISTEN"; then
    echo "✅ Server started successfully!"
    echo "📍 Local URL: http://localhost:5000"
    echo "📊 Logs: /app/work/logs/bypass/prod.log"
else
    echo "❌ Failed to start server. Check logs for details:"
    tail -n 20 /app/work/logs/bypass/prod.log
    exit 1
fi
