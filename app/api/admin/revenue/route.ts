import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/admin/revenue
 * Get revenue reports
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
    const startDate = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end') || new Date().toISOString();

    // Total revenue
    const totalResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE created_at BETWEEN $1 AND $2',
      [startDate, endDate]
    );
    const totalRevenue = parseFloat(totalResult.rows[0]?.total || '0');

    // Revenue by service type
    const byServiceResult = await query(
      `SELECT 
        service_type,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY service_type
      ORDER BY total DESC`,
      [startDate, endDate]
    );

    // Daily revenue
    const dailyResult = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as transactions,
        COALESCE(SUM(amount), 0) as revenue
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [startDate, endDate]
    );

    // Top paying users
    const topUsersResult = await query(
      `SELECT 
        u.id,
        u.username,
        COUNT(p.id) as transactions,
        COALESCE(SUM(p.amount), 0) as total_spent
      FROM users u
      LEFT JOIN payments p ON u.id = p.user_id
      WHERE p.created_at BETWEEN $1 AND $2
      GROUP BY u.id, u.username
      ORDER BY total_spent DESC
      LIMIT 10`,
      [startDate, endDate]
    );

    return NextResponse.json({
      summary: {
        totalRevenue,
        startDate,
        endDate,
      },
      byService: byServiceResult.rows.map((row: any) => ({
        serviceType: row.service_type,
        count: parseInt(row.count || '0'),
        revenue: parseFloat(row.total || '0'),
      })),
      daily: dailyResult.rows.map((row: any) => ({
        date: row.date,
        transactions: parseInt(row.transactions || '0'),
        revenue: parseFloat(row.revenue || '0'),
      })),
      topUsers: topUsersResult.rows.map((row: any) => ({
        userId: row.id,
        username: row.username,
        transactions: parseInt(row.transactions || '0'),
        totalSpent: parseFloat(row.total_spent || '0'),
      })),
    });
  } catch (error) {
    console.error('Get revenue error:', error);
    return NextResponse.json(
      { error: 'Failed to get revenue report' },
      { status: 500 }
    );
  }
}

