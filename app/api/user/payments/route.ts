import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/user/payments
 * Get user payment history
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

    const result = await query(
      `SELECT 
        id,
        amount,
        service_type,
        status,
        created_at
      FROM payments
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100`,
      [parseInt(userId)]
    );

    // Calculate total spent
    const totalResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE user_id = $1',
      [parseInt(userId)]
    );

    const totalSpent = parseFloat(totalResult.rows[0]?.total || '0');

    return NextResponse.json({
      payments: result.rows.map((row: any) => ({
        id: row.id,
        amount: parseFloat(row.amount || '0'),
        serviceType: row.service_type,
        status: row.status,
        createdAt: row.created_at,
      })),
      totalSpent,
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { error: 'Failed to get payments' },
      { status: 500 }
    );
  }
}

