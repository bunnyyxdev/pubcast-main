import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * POST /api/social/follow
 * Follow/Unfollow user
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

    const body = await request.json();
    const { followingId, action } = body; // action: 'follow' or 'unfollow'

    if (!followingId || !action) {
      return NextResponse.json(
        { error: 'Following ID and action are required' },
        { status: 400 }
      );
    }

    if (parseInt(userId) === parseInt(followingId)) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    if (action === 'follow') {
      // Check if already following
      const existingResult = await query(
        'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
        [parseInt(userId), parseInt(followingId)]
      );

      if (existingResult.rows.length === 0) {
        await query(
          'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
          [parseInt(userId), parseInt(followingId)]
        );
      }

      return NextResponse.json({ success: true, action: 'followed' });
    } else if (action === 'unfollow') {
      await query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [parseInt(userId), parseInt(followingId)]
      );

      return NextResponse.json({ success: true, action: 'unfollowed' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json(
      { error: 'Failed to follow/unfollow' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/social/follow?user_id=123
 * Check if following user
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ following: false });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('user_id');

    if (!targetUserId) {
      return NextResponse.json({ following: false });
    }

    const result = await query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [parseInt(userId), parseInt(targetUserId)]
    );

    return NextResponse.json({
      following: result.rows.length > 0,
    });
  } catch (error) {
    console.error('Check follow error:', error);
    return NextResponse.json({ following: false });
  }
}

