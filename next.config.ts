import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 使用动态模式（支持 API 路由和服务器组件）
  // 移除静态导出配置以支持 Vercel 动态部署
  images: {
    unoptimized: true,
  },
  // 禁用 trailingSlash
  trailingSlash: false,
  // 移除 basePath 以使用相对路径
  basePath: '',
  // 使用环境变量设置 assetPrefix
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export default nextConfig;
