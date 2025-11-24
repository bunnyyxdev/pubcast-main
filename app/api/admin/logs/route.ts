import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/admin/logs
 * Get system logs
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const logType = searchParams.get('type') || 'all';
    const offset = (page - 1) * limit;

    // For now, we'll create logs from existing data
    // In production, you'd have a dedicated logs table
    const logs: any[] = [];

    // Get recent user registrations
    const usersResult = await query(
      'SELECT id, username, created_at FROM users ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    usersResult.rows.forEach((row: any) => {
      logs.push({
        id: `user_${row.id}`,
        type: 'user_registration',
        message: `User ${row.username} registered`,
        timestamp: row.created_at,
        metadata: { userId: row.id, username: row.username },
      });
    });

    // Get recent payments
    const paymentsResult = await query(
      'SELECT id, user_id, amount, service_type, created_at FROM payments ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    paymentsResult.rows.forEach((row: any) => {
      logs.push({
        id: `payment_${row.id}`,
        type: 'payment',
        message: `Payment of ${row.amount} THB for ${row.service_type}`,
        timestamp: row.created_at,
        metadata: { paymentId: row.id, userId: row.user_id, amount: row.amount },
      });
    });

    // Sort by timestamp and paginate
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const filteredLogs = logType === 'all' 
      ? logs 
      : logs.filter(log => log.type === logType);
    
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / limit),
      },
    });
  } catch (error) {
    console.error('Get logs error:', error);
    return NextResponse.json(
      { error: 'Failed to get logs' },
      { status: 500 }
    );
  }
}

