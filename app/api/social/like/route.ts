import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * POST /api/social/like
 * Like/Unlike post
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
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if already liked
    const existingResult = await query(
      'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, parseInt(userId)]
    );

    if (existingResult.rows.length > 0) {
      // Unlike
      await query(
        'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, parseInt(userId)]
      );
      return NextResponse.json({ success: true, liked: false });
    } else {
      // Like
      await query(
        'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
        [postId, parseInt(userId)]
      );
      return NextResponse.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json(
      { error: 'Failed to like/unlike' },
      { status: 500 }
    );
  }
}

