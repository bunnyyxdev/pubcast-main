import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * POST /api/gamification/checkin
 * Daily check-in
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const userResult = await query(
      'SELECT last_checkin_date, streak_count FROM users WHERE id = $1',
      [parseInt(userId)]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    const lastCheckin = user.last_checkin_date ? new Date(user.last_checkin_date).toISOString().split('T')[0] : null;
    
    if (lastCheckin === today) {
      return NextResponse.json(
        { error: 'Already checked in today' },
        { status: 400 }
      );
    }

    // Calculate streak
    let newStreak = 1;
    if (lastCheckin) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastCheckin === yesterdayStr) {
        newStreak = (user.streak_count || 0) + 1;
      }
    }

    // Award points (10 base + streak bonus)
    const pointsAwarded = 10 + Math.min(newStreak, 7); // Max 7 bonus points

    // Update user
    await query(
      `UPDATE users 
       SET last_checkin_date = $1, 
           streak_count = $2,
           points = COALESCE(points, 0) + $3
       WHERE id = $4`,
      [today, newStreak, pointsAwarded, parseInt(userId)]
    );

    // Log points
    await query(
      'INSERT INTO points_history (user_id, points, reason) VALUES ($1, $2, $3)',
      [parseInt(userId), pointsAwarded, 'daily_checkin']
    );

    return NextResponse.json({
      success: true,
      points: pointsAwarded,
      streak: newStreak,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to check in' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gamification/checkin/status
 * Check check-in status
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { checkedIn: false },
        { status: 200 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const result = await query(
      'SELECT last_checkin_date FROM users WHERE id = $1',
      [parseInt(userId)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ checkedIn: false });
    }

    const lastCheckin = result.rows[0].last_checkin_date 
      ? new Date(result.rows[0].last_checkin_date).toISOString().split('T')[0]
      : null;

    return NextResponse.json({
      checkedIn: lastCheckin === today,
    });
  } catch (error) {
    console.error('Check-in status error:', error);
    return NextResponse.json({ checkedIn: false });
  }
}

