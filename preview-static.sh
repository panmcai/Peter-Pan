#!/bin/bash

# 静态网站预览脚本

echo "🚀 启动静态网站预览服务器..."
echo ""
echo "📦 目录: out/"
echo "🌐 地址: http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 检查 out 目录是否存在
if [ ! -d "out" ]; then
    echo "❌ 错误: out/ 目录不存在"
    echo "请先运行 'pnpm build' 构建静态网站"
    exit 1
fi

# 启动 HTTP 服务器
cd out && python3 -m http.server 8000
