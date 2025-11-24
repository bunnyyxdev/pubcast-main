import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/social/posts
 * Get posts (feed)
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userIdParam = searchParams.get('user_id'); // For user profile
    const offset = (page - 1) * limit;

    let sqlQuery = `
      SELECT 
        p.id,
        p.user_id,
        p.content,
        p.image_url,
        p.created_at,
        u.username,
        u.profile_photo,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
    `;

    if (userId) {
      sqlQuery += `,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = $1) > 0 as is_liked
      `;
    } else {
      sqlQuery += `, false as is_liked`;
    }

    sqlQuery += `
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
    `;

    const params: any[] = userId ? [parseInt(userId)] : [];

    if (userIdParam) {
      sqlQuery += ` WHERE p.user_id = $${params.length + 1}`;
      params.push(parseInt(userIdParam));
    } else if (userId) {
      // Show posts from followed users + own posts
      sqlQuery += ` 
        WHERE p.user_id = $${params.length + 1}
        OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $${params.length + 1})
      `;
      params.push(parseInt(userId), parseInt(userId));
    }

    sqlQuery += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sqlQuery, params);

    return NextResponse.json({
      posts: result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        username: row.username,
        profilePhoto: row.profile_photo,
        content: row.content,
        imageUrl: row.image_url,
        createdAt: row.created_at,
        likesCount: parseInt(row.likes_count || '0'),
        commentsCount: parseInt(row.comments_count || '0'),
        isLiked: row.is_liked || false,
      })),
      pagination: {
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Failed to get posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/posts
 * Create post
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
    const { content, imageUrl } = body;

    if (!content && !imageUrl) {
      return NextResponse.json(
        { error: 'Content or image is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO posts (user_id, content, image_url) VALUES ($1, $2, $3) RETURNING id',
      [parseInt(userId), content || null, imageUrl || null]
    );

    return NextResponse.json({
      success: true,
      postId: result.rows[0].id,
    });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

