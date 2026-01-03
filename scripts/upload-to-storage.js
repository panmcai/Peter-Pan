#!/usr/bin/env node

/**
 * 上传静态网站压缩包到对象存储
 */

const fs = require('fs');
const path = require('path');

// 从环境变量获取对象存储配置
const { COZE_BUCKET_ENDPOINT_URL, COZE_BUCKET_NAME } = process.env;

const filePath = path.join(__dirname, '..', 'website-complete.tar.gz');
const fileName = 'website-complete.tar.gz';

async function uploadFile() {
  const S3Storage = require('coze-coding-dev-sdk').S3Storage;

  const storage = new S3Storage({
    endpointUrl: COZE_BUCKET_ENDPOINT_URL,
    accessKey: '',
    secretKey: '',
    bucketName: COZE_BUCKET_NAME,
    region: 'cn-beijing',
  });

  console.log('📦 读取文件...');
  const fileContent = fs.readFileSync(filePath);
  console.log(`✅ 文件大小: ${(fileContent.length / 1024).toFixed(2)} KB`);

  console.log('🚀 开始上传...');
  const key = await storage.uploadFile({
    fileContent: fileContent,
    fileName: fileName,
    contentType: 'application/gzip',
  });

  console.log(`✅ 上传成功！文件 key: ${key}`);

  console.log('🔗 生成下载链接...');
  const url = await storage.generatePresignedUrl({
    key: key,
    expireTime: 3600 * 24, // 24小时有效期
  });

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📥 下载链接');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log(url);
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('💡 提示：');
  console.log('- 链接有效期：24小时');
  console.log('- 文件大小：463KB');
  console.log('- 解压后可直接部署到静态托管平台');
  console.log('');

  return url;
}

uploadFile().catch(error => {
  console.error('❌ 上传失败:', error);
  process.exit(1);
});
