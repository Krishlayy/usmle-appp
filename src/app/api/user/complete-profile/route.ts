import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { setUserCountry } from '@/lib/userCountryStore';
import { findCountryByCode } from '@/lib/countries';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { countryCode, countryName } = body;

    if (!countryCode || typeof countryCode !== 'string') {
      return new NextResponse('Valid countryCode is required', { status: 400 });
    }

    const validCountry = findCountryByCode(countryCode);
    if (!validCountry) {
      return new NextResponse('Invalid country code provided', { status: 400 });
    }

    const finalName = countryName || validCountry.name;

    setUserCountry(session.user.id, {
      countryCode: validCountry.code,
      countryName: finalName
    });

    return NextResponse.json({
      success: true,
      countryCode: validCountry.code,
      countryName: finalName
    });
  } catch (error) {
    console.error('[COMPLETE_PROFILE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}