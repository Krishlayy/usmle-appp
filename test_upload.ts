import 'dotenv/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function main() {
  const bucketName = process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;
  
  if (!bucketName || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("Missing AWS credentials");
    process.exit(1);
  }

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: 'test-image.png',
    Body: Buffer.from('fake image content'),
    ContentType: 'image/png',
  });

  try {
    await s3Client.send(command);
    console.log("Successfully uploaded to S3!");
    console.log(`URL: https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/test-image.png`);
  } catch (error) {
    console.error("Upload error:", error);
  }
}

main();
