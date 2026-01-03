/**
 * 上传静态网站压缩包到对象存储
 */

import { S3Storage } from "coze-coding-dev-sdk";
import { readFileSync } from "fs";
import { join } from "path";

const filePath = join(process.cwd(), "website-complete.tar.gz");
const fileName = "website-complete.tar.gz";

async function main() {
  console.log("📦 读取文件...");
  const fileContent = readFileSync(filePath);
  console.log(`✅ 文件大小: ${(fileContent.length / 1024).toFixed(2)} KB`);

  const storage = new S3Storage({
    endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
    accessKey: "",
    secretKey: "",
    bucketName: process.env.COZE_BUCKET_NAME,
    region: "cn-beijing",
  });

  console.log("🚀 开始上传...");
  const key = await storage.uploadFile({
    fileContent: fileContent,
    fileName: fileName,
    contentType: "application/gzip",
  });

  console.log(`✅ 上传成功！文件 key: ${key}`);

  console.log("🔗 生成下载链接...");
  const url = await storage.generatePresignedUrl({
    key: key,
    expireTime: 3600 * 24, // 24小时有效期
  });

  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("📥 下载链接");
  console.log("═══════════════════════════════════════════");
  console.log("");
  console.log(url);
  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("");
  console.log("💡 提示：");
  console.log("- 链接有效期：24小时");
  console.log("- 文件大小：463KB");
  console.log("- 解压后可直接部署到静态托管平台");
  console.log("");

  console.log("\n✅ 上传完成！");
}

main().catch(error => {
  console.error("❌ 上传失败:", error);
  process.exit(1);
});
