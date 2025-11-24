import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/social/comments?post_id=123
 * Get comments for a post
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        c.id,
        c.post_id,
        c.user_id,
        c.content,
        c.created_at,
        u.username,
        u.profile_photo
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC`,
      [parseInt(postId)]
    );

    return NextResponse.json({
      comments: result.rows.map((row: any) => ({
        id: row.id,
        postId: row.post_id,
        userId: row.user_id,
        username: row.username,
        profilePhoto: row.profile_photo,
        content: row.content,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to get comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/comments
 * Add comment
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
    const { postId, content } = body;

    if (!postId || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, created_at',
      [postId, parseInt(userId), content.trim()]
    );

    // Get user info
    const userResult = await query(
      'SELECT username, profile_photo FROM users WHERE id = $1',
      [parseInt(userId)]
    );

    return NextResponse.json({
      success: true,
      comment: {
        id: result.rows[0].id,
        postId,
        userId: parseInt(userId),
        username: userResult.rows[0].username,
        profilePhoto: userResult.rows[0].profile_photo,
        content: content.trim(),
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social/comments?comment_id=123
 * Delete comment
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('comment_id');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Check if user owns the comment
    const checkResult = await query(
      'SELECT user_id FROM comments WHERE id = $1',
      [parseInt(commentId)]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (checkResult.rows[0].user_id.toString() !== userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    await query('DELETE FROM comments WHERE id = $1', [parseInt(commentId)]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

