import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/admin/analytics
 * Get analytics data
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7'; // days

    const periodDays = parseInt(period);
    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    // Total users
    const totalUsersResult = await query('SELECT COUNT(*) as count FROM users', []);
    const totalUsers = parseInt(totalUsersResult.rows[0]?.count || '0');

    // New users in period
    const newUsersResult = await query(
      'SELECT COUNT(*) as count FROM users WHERE created_at > $1',
      [periodStart]
    );
    const newUsers = parseInt(newUsersResult.rows[0]?.count || '0');

    // Total messages
    const totalMessagesResult = await query('SELECT COUNT(*) as count FROM messages', []);
    const totalMessages = parseInt(totalMessagesResult.rows[0]?.count || '0');

    // Messages in period
    const messagesResult = await query(
      'SELECT COUNT(*) as count FROM messages WHERE created_at > $1',
      [periodStart]
    );
    const messages = parseInt(messagesResult.rows[0]?.count || '0');

    // Total revenue
    const revenueResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments',
      []
    );
    const totalRevenue = parseFloat(revenueResult.rows[0]?.total || '0');

    // Revenue in period
    const periodRevenueResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE created_at > $1',
      [periodStart]
    );
    const periodRevenue = parseFloat(periodRevenueResult.rows[0]?.total || '0');

    // Online users (active in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const onlineUsersResult = await query(
      'SELECT COUNT(*) as count FROM users WHERE updated_at > $1',
      [fiveMinutesAgo]
    );
    const onlineUsers = parseInt(onlineUsersResult.rows[0]?.count || '0');

    // Daily stats for chart
    const dailyStatsResult = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM payments
      WHERE created_at > $1
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [periodStart]
    );

    return NextResponse.json({
      overview: {
        totalUsers,
        newUsers,
        totalMessages,
        messages,
        totalRevenue,
        periodRevenue,
        onlineUsers,
      },
      dailyStats: dailyStatsResult.rows.map((row: any) => ({
        date: row.date,
        revenue: parseFloat(row.count || '0'),
      })),
      period: periodDays,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}

