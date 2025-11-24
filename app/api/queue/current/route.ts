import { NextRequest, NextResponse } from 'next/server';

// In-memory current item (in production, use Redis or database)
let currentItem: any = null;

/**
 * GET /api/queue/current
 * Get currently playing item
 */
export async function GET(request: NextRequest) {
  try {
    // In production, get from database or Redis
    return NextResponse.json({
      currentItem,
    });
  } catch (error) {
    console.error('Get current item error:', error);
    return NextResponse.json(
      { error: 'Failed to get current item' },
      { status: 500 }
    );
  }
}

