import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/gamification/leaderboard
 * Get leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'points';
    const limit = parseInt(searchParams.get('limit') || '10');

    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    let leaderboard: any[] = [];

    if (type === 'points') {
      const result = await query(
        `SELECT 
          id,
          username,
          COALESCE(points, 0) as points
        FROM users
        ORDER BY COALESCE(points, 0) DESC
        LIMIT $1`,
        [limit]
      );

      leaderboard = result.rows.map((row: any, idx: number) => ({
        rank: idx + 1,
        username: row.username,
        points: parseInt(row.points || '0'),
        isCurrentUser: userId ? row.id.toString() === userId : false,
      }));
    } else if (type === 'revenue') {
      const result = await query(
        `SELECT 
          u.id,
          u.username,
          COALESCE(SUM(p.amount), 0) as total_revenue
        FROM users u
        LEFT JOIN payments p ON u.id = p.user_id
        GROUP BY u.id, u.username
        ORDER BY total_revenue DESC
        LIMIT $1`,
        [limit]
      );

      leaderboard = result.rows.map((row: any, idx: number) => ({
        rank: idx + 1,
        username: row.username,
        points: parseFloat(row.total_revenue || '0'),
        isCurrentUser: userId ? row.id.toString() === userId : false,
      }));
    }

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}

