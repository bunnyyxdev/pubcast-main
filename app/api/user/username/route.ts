import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * PUT /api/user/username
 * Update username
 */
export async function PUT(request: NextRequest) {
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
    const { username } = body;

    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingResult = await query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [username.trim(), parseInt(userId)]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Update username
    await query(
      'UPDATE users SET username = $1 WHERE id = $2',
      [username.trim(), parseInt(userId)]
    );

    // Update cookie
    cookieStore.set('username', username.trim(), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update username error:', error);
    return NextResponse.json(
      { error: 'Failed to update username' },
      { status: 500 }
    );
  }
}

