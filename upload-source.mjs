import { S3Storage } from "coze-coding-dev-sdk";
import { readFileSync } from "fs";

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: "",
  secretKey: "",
  bucketName: process.env.COZE_BUCKET_NAME,
  region: "cn-beijing",
});

async function uploadSource() {
  try {
    console.log("正在上传源码包...");
    const fileContent = readFileSync("/tmp/personal-website-source.tar.gz");

    const fileKey = await storage.uploadFile({
      fileContent: fileContent,
      fileName: `personal-website-source_${Date.now()}.tar.gz`,
      contentType: "application/gzip",
    });

    console.log("上传成功！文件 Key:", fileKey);

    const downloadUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 86400, // 24小时有效期
    });

    console.log("\n=================================");
    console.log("下载链接（24小时内有效）:");
    console.log("=================================");
    console.log(downloadUrl);
    console.log("=================================\n");

    process.exit(0);
  } catch (error) {
    console.error("上传失败:", error);
    process.exit(1);
  }
}

uploadSource();
