import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. 启用静态导出模式（必须）
  output: 'export',

  // 2. 设置基础路径（关键！必须与你的访问路径匹配）
  basePath: '/panmcai', // 这里应替换为你的仓库名或子路径

  // 3. 可选：设置资源路径前缀（如果你的静态资源也部署在同域名下）
  assetPrefix: '/panmcai/',

  // 注意：使用 `output: 'export'` 后，将无法使用需要服务端的API路由等特性。
};

export default nextConfig;
