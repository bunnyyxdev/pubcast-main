import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * PATCH /api/admin/users/[userId]
 * Update user (ban/unban/delete)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Not authenticated as admin' },
        { status: 401 }
      );
    }

    // Verify admin
    const adminCheck = await query(
      'SELECT id FROM admin_users WHERE id = $1',
      [adminSession]
    );

    if (adminCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid admin session' },
        { status: 401 }
      );
    }

    const { userId: userIdParam } = await params;
    const userId = parseInt(userIdParam);
    const body = await request.json();
    const { action } = body; // 'ban', 'unban', 'delete'

    if (!['ban', 'unban', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (action === 'delete') {
      // Delete user and all related data
      await query('DELETE FROM messages WHERE user_id = $1', [userId]);
      await query('DELETE FROM payments WHERE user_id = $1', [userId]);
      await query('DELETE FROM users WHERE id = $1', [userId]);
      
      return NextResponse.json({ success: true, action: 'deleted' });
    } else if (action === 'ban') {
      // Add banned column if it doesn't exist, then update
      // For now, we'll use a simple approach - add a banned flag
      // Note: You may need to add this column to the database
      await query(
        `UPDATE users SET banned = true WHERE id = $1`,
        [userId]
      );
      
      return NextResponse.json({ success: true, action: 'banned' });
    } else if (action === 'unban') {
      await query(
        `UPDATE users SET banned = false WHERE id = $1`,
        [userId]
      );
      
      return NextResponse.json({ success: true, action: 'unbanned' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

