#!/bin/bash
set -e

echo "📦 Starting build process..."

# 确保 corepack 已启用
echo "🔧 Enabling corepack..."
corepack enable

# 准备并激活 pnpm 9.15.4
echo "🔧 Preparing pnpm@9.15.4..."
corepack prepare pnpm@9.15.4 --activate

# 验证 pnpm 版本
PNPM_VERSION=$(pnpm --version)
echo "✅ Using pnpm version: $PNPM_VERSION"

if [ "$PNPM_VERSION" != "9.15.4" ]; then
  echo "❌ Error: pnpm version is not 9.15.4, got $PNPM_VERSION"
  exit 1
fi

# 安装依赖
echo "📥 Installing dependencies..."
pnpm install

# 构建项目
echo "🔨 Building project..."
pnpm run build

echo "✅ Build completed successfully!"
