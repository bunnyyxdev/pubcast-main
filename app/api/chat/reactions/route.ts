import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * POST /api/chat/reactions
 * Add reaction to message
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
    const { messageId, reaction } = body;

    if (!messageId || !reaction) {
      return NextResponse.json(
        { error: 'Message ID and reaction are required' },
        { status: 400 }
      );
    }

    // Check if reaction already exists
    const existingResult = await query(
      'SELECT id FROM message_reactions WHERE message_id = $1 AND user_id = $2 AND reaction = $3',
      [messageId, parseInt(userId), reaction]
    );

    if (existingResult.rows.length > 0) {
      // Remove reaction
      await query(
        'DELETE FROM message_reactions WHERE message_id = $1 AND user_id = $2 AND reaction = $3',
        [messageId, parseInt(userId), reaction]
      );
      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // Add reaction
      await query(
        'INSERT INTO message_reactions (message_id, user_id, reaction) VALUES ($1, $2, $3)',
        [messageId, parseInt(userId), reaction]
      );
      return NextResponse.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error('Reaction error:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/reactions?message_id=123
 * Get reactions for a message
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
      `SELECT reaction, COUNT(*) as count 
       FROM message_reactions 
       WHERE message_id = $1 
       GROUP BY reaction`,
      [parseInt(messageId)]
    );

    const reactions: { [key: string]: number } = {};
    result.rows.forEach((row: any) => {
      reactions[row.reaction] = parseInt(row.count);
    });

    return NextResponse.json({ reactions });
  } catch (error) {
    console.error('Get reactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get reactions' },
      { status: 500 }
    );
  }
}

