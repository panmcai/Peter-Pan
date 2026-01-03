#!/usr/bin/env node

/**
 * 将 Next.js 静态导出的绝对路径转换为相对路径
 * 使得双击 HTML 文件也能正常预览
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'out');

/**
 * 修复单个 HTML 文件中的路径
 */
function fixHtmlFile(filePath) {
  console.log(`处理: ${path.basename(filePath)}`);

  let content = fs.readFileSync(filePath, 'utf8');

  // 替换 CSS 路径：/_next/static/... -> ./_next/static/...
  content = content.replace(/href="\/_next\/static\//g, 'href="./_next/static/');

  // 替换 JS 路径：/_next/static/... -> ./_next/static/...
  content = content.replace(/src="\/_next\/static\//g, 'src="./_next/static/');
  content = content.replace(/"\/_next\/static\//g, '"./_next/static/');

  // 替换字体路径：/_next/static/... -> ./_next/static/...
  content = content.replace(/url\(\/_next\/static\//g, 'url(./_next/static/');

  // 替换图片路径
  content = content.replace(/src="\/(?!_next)/g, 'src="$1');
  content = content.replace(/href="\/(?!_next)/g, 'href="$1');

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
