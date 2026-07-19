import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new NextResponse('Missing file', { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bucketName = process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;

    // If AWS credentials are not set, fall back to base64 encoding (not recommended for production, but prevents crashes)
    if (!bucketName || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn("AWS S3 environment variables are missing! Falling back to Base64 data URI.");
      const base64Str = buffer.toString('base64');
      const publicUrl = `data:${file.type};base64,${base64Str}`;
      return NextResponse.json({ publicUrl });
    }

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const extension = file.name.split('.').pop() || 'png';
    const filename = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

    return NextResponse.json({ publicUrl });
  } catch (error: any) {
    console.error('[IMAGE_UPLOAD_ERROR]', error);
    return new NextResponse('Internal server error: ' + (error.message || 'Unknown error'), { status: 500 });
  }
}

