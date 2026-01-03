import { S3Storage } from 'coze-coding-dev-sdk';
import fs from 'fs';
import path from 'path';

const storage = new S3Storage({
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

async function uploadAndGenerateUrl() {
  try {
    // 获取最新的打包文件
    const files = fs.readdirSync('/tmp')
      .filter(f => f.startsWith('personal-website-static-final-') && f.endsWith('.tar.gz'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join('/tmp', a));
        const statB = fs.statSync(path.join('/tmp', b));
        return statB.mtime - statA.mtime;
      });

    if (files.length === 0) {
      throw new Error('未找到打包文件');
    }

    const filePath = path.join('/tmp', files[0]);
    const fileName = 'personal-website-static-final.tar.gz';

    console.log('正在读取文件...');
    console.log(`文件: ${path.basename(filePath)}`);
    const fileContent = fs.readFileSync(filePath);
    console.log(`文件大小: ${(fileContent.length / 1024).toFixed(2)} KB`);

    console.log('正在上传到对象存储...');
    const fileKey = await storage.uploadFile({
      fileContent: fileContent,
      fileName: fileName,
      contentType: 'application/gzip',
    });

    console.log(`文件上传成功! Key: ${fileKey}`);

    console.log('正在生成下载链接...');
    const downloadUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 86400, // 24小时
    });

    console.log('下载链接:', downloadUrl);

    // 保存链接到文件
    fs.writeFileSync('/tmp/download-link.txt', downloadUrl);
    console.log('链接已保存到 /tmp/download-link.txt');

    return downloadUrl;
  } catch (error) {
    console.error('上传失败:', error);
    throw error;
  }
}

uploadAndGenerateUrl()
  .then(url => {
    console.log('\n✅ 上传完成!');
    console.log('📥 下载链接:', url);
  })
  .catch(error => {
    console.error('❌ 错误:', error);
    process.exit(1);
  });
