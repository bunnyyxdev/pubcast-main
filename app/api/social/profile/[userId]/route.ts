import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/social/profile/[userId]
 * Get public user profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const userIdParam = resolvedParams.userId;
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('user_id')?.value;

    // Get user info
    const userResult = await query(
      'SELECT id, username, profile_photo, created_at FROM users WHERE id = $1',
      [parseInt(userIdParam)]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Get stats
    const [postsCount, followersCount, followingCount, isFollowing] = await Promise.all([
      query('SELECT COUNT(*) as count FROM posts WHERE user_id = $1', [parseInt(userIdParam)]),
      query('SELECT COUNT(*) as count FROM follows WHERE following_id = $1', [parseInt(userIdParam)]),
      query('SELECT COUNT(*) as count FROM follows WHERE follower_id = $1', [parseInt(userIdParam)]),
      currentUserId
        ? query(
            'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
            [parseInt(currentUserId), parseInt(userIdParam)]
          )
        : Promise.resolve({ rows: [] }),
    ]);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        profilePhoto: user.profile_photo,
        createdAt: user.created_at,
      },
      stats: {
        posts: parseInt(postsCount.rows[0]?.count || '0'),
        followers: parseInt(followersCount.rows[0]?.count || '0'),
        following: parseInt(followingCount.rows[0]?.count || '0'),
      },
      isFollowing: isFollowing.rows.length > 0,
      isOwnProfile: currentUserId ? currentUserId === userIdParam : false,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

