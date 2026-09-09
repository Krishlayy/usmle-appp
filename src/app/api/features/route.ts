import { NextResponse } from 'next/server';
import { getAllFeatureFlags } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const flags = await getAllFeatureFlags();
    return NextResponse.json(flags);
  } catch (error) {
    console.error('[FEATURES_GET_ERROR]', error);
    // Fail safely with all flags disabled
    return NextResponse.json({
      READY_DECKS_V2: false,
      MEDICAL_LIBRARY: false,
      UNIFIED_SEARCH: false,
      VIDEO_LEARNING: false,
      STUDY_PLANNER: false,
    });
  }
}
