import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * DELETE /api/user/delete
 * Delete user account
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

    // Delete all user data (cascade will handle related records)
    await query('DELETE FROM users WHERE id = $1', [parseInt(userId)]);

    // Clear cookies
    cookieStore.delete('user_id');
    cookieStore.delete('username');
    cookieStore.delete('phone_number');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

