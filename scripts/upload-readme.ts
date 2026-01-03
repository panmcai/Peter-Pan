/**
 * 上传 README 文件到对象存储
 */

import { S3Storage } from "coze-coding-dev-sdk";
import { readFileSync } from "fs";
import { join } from "path";

const filePath = join(process.cwd(), "website-complete.README.md");
const fileName = "website-complete.README.md";

async function main() {
  console.log("📦 读取 README 文件...");
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
    contentType: "text/markdown",
  });

  console.log(`✅ 上传成功！文件 key: ${key}`);

  console.log("🔗 生成下载链接...");
  const url = await storage.generatePresignedUrl({
    key: key,
    expireTime: 3600 * 24, // 24小时有效期
  });

  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("📥 README 下载链接");
  console.log("═══════════════════════════════════════════");
  console.log("");
  console.log(url);
  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("");

  return url;
}

main().catch(error => {
  console.error("❌ 上传失败:", error);
  process.exit(1);
});
