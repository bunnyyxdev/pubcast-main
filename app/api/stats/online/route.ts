import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/stats/online
 * 
 * Get count of online users (users active in last 5 minutes)
 * 
 * Response:
 * - Success (200): { count: number }
 * - Error (500): { error: string }
 */
export async function GET(request: NextRequest) {
  try {
    // Count users who have been active in the last 5 minutes
    // Active means: visited any page (updated_at reflects last activity)
    // Calculate timestamp 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const result = await query(
      `SELECT COUNT(*) as count
       FROM users
       WHERE updated_at > $1`,
      [fiveMinutesAgo]
    );

    const count = result.rows[0]?.count || 0;

    return NextResponse.json({
      count: parseInt(count.toString()),
    });
  } catch (error) {
    console.error('Get online users error:', error);
    return NextResponse.json(
      { error: 'Failed to get online users count' },
      { status: 500 }
    );
  }
}

