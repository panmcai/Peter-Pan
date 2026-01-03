#!/usr/bin/env node

/**
 * 将 Next.js 静态导出的绝对路径转换为相对路径
 * 使得双击 HTML 文件也能正常预览
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'out');

/**
 * 计算从当前文件到 out/ 目录的相对路径
 * @param {string} filePath - 当前文件的完整路径
 * @returns {string} 相对路径前缀（如 "../", "../../", 或 ""）
 */
function getRelativePathPrefix(filePath) {
  const relativePath = path.relative(OUT_DIR, filePath);
  const depth = relativePath.split(path.sep).length - 1; // 减1是因为文件名本身也算一层

  if (depth === 0) {
    // 在根目录（如 out/index.html）
    return '';
  } else {
    // 在子目录中（如 out/about/index.html -> "../"）
    return '../'.repeat(depth);
  }
}

/**
 * 修复单个 HTML 文件中的路径
 */
function fixHtmlFile(filePath) {
  const relativePath = path.relative(OUT_DIR, filePath);
  console.log(`处理: ${relativePath}`);

  const prefix = getRelativePathPrefix(filePath);
  let content = fs.readFileSync(filePath, 'utf8');

  // 替换 CSS 路径：/_next/static/... -> {prefix}_next/static/...
  content = content.replace(/href="\/_next\/static\//g, `href="${prefix}_next/static/`);

  // 替换 JS 路径：/_next/static/... -> {prefix}_next/static/...
  content = content.replace(/src="\/_next\/static\//g, `src="${prefix}_next/static/`);
  content = content.replace(/"\/_next\/static\//g, `"${prefix}_next/static/`);

  // 替换字体路径：/_next/static/... -> {prefix}_next/static/...
  content = content.replace(/url\(\/_next\/static\//g, `url(${prefix}_next/static/`);

  // 替换 favicon 路径
  content = content.replace(/href="\/favicon\.ico/g, `href="${prefix}favicon.ico`);

  // 替换根路径 / -> {prefix}index.html 或 {prefix}
  content = content.replace(/href="\/"/g, `href="${prefix}index.html"`);

  // 替换页面链接路径：/about -> {prefix}about.html, /blog -> {prefix}blog.html 等
  content = content.replace(/href="\/(?!_next)([^"]+)"/g, (match, route) => {
    // 跳过外部链接和已有协议的链接
    if (route.startsWith('http') || route.startsWith('//')) {
      return match;
    }
    return `href="${prefix}${route}.html"`;
  });

  // 替换图片路径（非 _next 开头的）
  content = content.replace(/src="\/(?!_next)([^"]+)"/g, (match, imgPath) => {
    return `src="${prefix}${imgPath}"`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * 递归处理目录中的所有 HTML 文件
 */
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 递归处理子目录
      if (file !== '_next') { // 跳过 _next 目录，它不需要处理
        processDirectory(filePath);
      }
    } else if (file.endsWith('.html')) {
      // 处理 HTML 文件
      fixHtmlFile(filePath);
    }
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔧 修复相对路径...');
  console.log('');

  if (!fs.existsSync(OUT_DIR)) {
    console.error('❌ 错误: out/ 目录不存在');
    console.log('请先运行: pnpm build');
    process.exit(1);
  }

  processDirectory(OUT_DIR);

  console.log('');
  console.log('✅ 完成！');
  console.log('');
  console.log('📁 现在可以双击 HTML 文件预览了');
  console.log('');
}

main();
