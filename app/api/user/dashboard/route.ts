import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/user/dashboard
 * Get user dashboard stats
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userIdInt = parseInt(userId);

    // Get total posts (payments)
    const totalPostsResult = await query(
      'SELECT COUNT(*) as count FROM payments WHERE user_id = $1',
      [userIdInt]
    );
    const totalPosts = parseInt(totalPostsResult.rows[0]?.count || '0');

    // Get total messages
    const totalMessagesResult = await query(
      'SELECT COUNT(*) as count FROM messages WHERE user_id = $1',
      [userIdInt]
    );
    const totalMessages = parseInt(totalMessagesResult.rows[0]?.count || '0');

    // Get total spent
    const totalSpentResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE user_id = $1',
      [userIdInt]
    );
    const totalSpent = parseFloat(totalSpentResult.rows[0]?.total || '0');

    // Get this month's stats
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const postsThisMonthResult = await query(
      'SELECT COUNT(*) as count FROM payments WHERE user_id = $1 AND created_at >= $2',
      [userIdInt, firstDayOfMonth.toISOString()]
    );
    const postsThisMonth = parseInt(postsThisMonthResult.rows[0]?.count || '0');

    const messagesThisMonthResult = await query(
      'SELECT COUNT(*) as count FROM messages WHERE user_id = $1 AND created_at >= $2',
      [userIdInt, firstDayOfMonth.toISOString()]
    );
    const messagesThisMonth = parseInt(messagesThisMonthResult.rows[0]?.count || '0');

    const spentThisMonthResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE user_id = $1 AND created_at >= $2',
      [userIdInt, firstDayOfMonth.toISOString()]
    );
    const spentThisMonth = parseFloat(spentThisMonthResult.rows[0]?.total || '0');

    return NextResponse.json({
      totalPosts,
      totalMessages,
      totalSpent,
      postsThisMonth,
      messagesThisMonth,
      spentThisMonth,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get dashboard stats' },
      { status: 500 }
    );
  }
}

