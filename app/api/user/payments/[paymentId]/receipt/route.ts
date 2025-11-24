import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/user/payments/[paymentId]/receipt
 * Generate receipt PDF (simplified - returns JSON for now)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { paymentId } = await params;
    const result = await query(
      `SELECT 
        p.id,
        p.amount,
        p.service_type,
        p.status,
        p.created_at,
        u.username,
        u.phone_number
      FROM payments p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.user_id = $2`,
      [parseInt(paymentId), parseInt(userId)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const payment = result.rows[0];

    // For now, return JSON receipt (can be converted to PDF later)
    const receipt = {
      receiptNumber: `REC-${payment.id.toString().padStart(6, '0')}`,
      date: new Date(payment.created_at).toLocaleString('th-TH'),
      customer: {
        username: payment.username,
        phone: payment.phone_number,
      },
      items: [
        {
          description: payment.service_type === 'image' ? 'ส่งรูปขึ้นจอ' :
                       payment.service_type === 'message' ? 'ส่งข้อความขึ้นจอ' :
                       payment.service_type === 'video' ? 'ส่งวิดีโอขึ้นจอ' :
                       payment.service_type,
          amount: parseFloat(payment.amount || '0'),
        },
      ],
      total: parseFloat(payment.amount || '0'),
      status: payment.status,
    };

    return NextResponse.json(receipt);
  } catch (error) {
    console.error('Get receipt error:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}

