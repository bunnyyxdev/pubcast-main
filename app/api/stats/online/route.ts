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
    // Active means: sent a message, logged in, or updated their profile
    const result = await query(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM (
         SELECT user_id, created_at as activity_time
         FROM messages
         WHERE created_at > NOW() - INTERVAL '5 minutes'
         
         UNION
         
         SELECT id as user_id, updated_at as activity_time
         FROM users
         WHERE updated_at > NOW() - INTERVAL '5 minutes'
       ) AS active_users`,
      []
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

