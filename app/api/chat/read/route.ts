import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * POST /api/chat/read
 * Mark message as read
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
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Check if already read
    const existingResult = await query(
      'SELECT id FROM message_reads WHERE message_id = $1 AND user_id = $2',
      [messageId, parseInt(userId)]
    );

    if (existingResult.rows.length === 0) {
      // Mark as read
      await query(
        'INSERT INTO message_reads (message_id, user_id) VALUES ($1, $2)',
        [messageId, parseInt(userId)]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark as read' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/read?message_id=123
 * Get read count for message
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('message_id');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT COUNT(*) as count FROM message_reads WHERE message_id = $1',
      [parseInt(messageId)]
    );

    const count = parseInt(result.rows[0]?.count || '0');

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Get read count error:', error);
    return NextResponse.json(
      { error: 'Failed to get read count' },
      { status: 500 }
    );
  }
}

