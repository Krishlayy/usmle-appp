import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  let ip = 'Unknown IP';
  if (forwardedFor) {
    ip = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp;
  }
  
  if (ip === '::1' || ip === '127.0.0.1' || ip === '1') {
    ip = 'Local Environment';
  }
  
  return NextResponse.json({ ip });
}
