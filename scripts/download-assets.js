#!/usr/bin/env node

/**
 * 下载线上资源到本地
 * 用于管理静态资源
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 配置需要下载的资源
const ASSETS = [
  {
    url: 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
    output: 'public/tailwind.js',
    description: 'Tailwind CSS (CDN版本)'
  },
  {
    url: 'https://unpkg.com/react@19/umd/react.production.min.js',
    output: 'public/react.min.js',
    description: 'React (生产版本)'
  },
  {
    url: 'https://unpkg.com/react-dom@19/umd/react-dom.production.min.js',
    output: 'public/react-dom.min.js',
    description: 'React DOM (生产版本)'
  },
];

/**
 * 下载单个文件
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(outputPath);

    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // 处理重定向
        fs.unlinkSync(outputPath);
        return downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        fs.unlinkSync(outputPath);
        return reject(new Error(`下载失败: ${response.statusCode}`));
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(outputPath);
      reject(err);
    });
  });
}

/**
 * 显示进度条
 */
function showProgress(current, total, message) {
  const percentage = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
  process.stdout.write(`\r${message} [${bar}] ${percentage}%`);
}

/**
 * 主函数
 */
async function main() {
  console.log('📥 开始下载线上资源...\n');

  for (let i = 0; i < ASSETS.length; i++) {
    const asset = ASSETS[i];
    const outputPath = path.join(__dirname, '..', asset.output);

    console.log(`\n${i + 1}/${ASSETS.length}. ${asset.description}`);
    console.log(`   URL: ${asset.url}`);
    console.log(`   输出: ${asset.output}`);

    // 创建输出目录
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      showProgress(i, ASSETS.length, '下载中');
      await downloadFile(asset.url, outputPath);

      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`\r${i + 1}/${ASSETS.length}. ✅ 完成 (${sizeKB} KB)`);
    } catch (error) {
      console.error(`\r${i + 1}/${ASSETS.length}. ❌ 失败: ${error.message}`);
    }
  }

  console.log('\n\n✅ 所有资源下载完成！');
}

// 运行
main().catch(console.error);
