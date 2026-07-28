import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authRateLimiter } from '@/lib/redis';
import { headers } from 'next/headers';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    // Basic IP-based rate limiting
    const ip = (await headers()).get('x-forwarded-for') || 'anonymous';
    try {
      const { success } = await authRateLimiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { message: 'Too many signup attempts. Please try again later.' },
          { status: 429 }
        );
      }
    } catch (e) {
      console.warn('Rate limiter unreachable, bypassing', e);
    }

    const body = await req.json();
    const { name, email, password } = signupSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Generate Verification Token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // TODO: Send email via Resend/SendGrid here
    console.log(`\n\n[DUMMY EMAIL SERVICE]`);
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your Micro Q-Bank account`);
    console.log(`Click here to verify: http://localhost:3000/verify-email?token=${token}\n\n`);

    return NextResponse.json(
      { message: 'User created successfully. Please check your email to verify your account.', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError<unknown>;
      return NextResponse.json({ message: zodError.issues[0].message }, { status: 400 });
    }
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
