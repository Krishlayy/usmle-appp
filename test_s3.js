const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function testS3() {
  console.log("Region:", process.env.AWS_REGION);
  console.log("Bucket:", process.env.AWS_S3_BUCKET_NAME);
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: 'test-upload.txt',
    Body: Buffer.from('hello world'),
    ContentType: 'text/plain',
  });

  try {
    await s3Client.send(command);
    console.log("Successfully uploaded to S3!");
  } catch (error) {
    console.error("AWS S3 Upload Error:", error);
  }
}

testS3();
