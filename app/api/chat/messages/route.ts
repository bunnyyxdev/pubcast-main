import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/chat/messages
 * 
 * Get chat messages
 * 
 * Query params:
 * - chat_id: number (optional, defaults to 1 for global chat)
 * - limit: number (optional, defaults to 50)
 * - before: timestamp (optional, for pagination)
 * 
 * Response:
 * - Success (200): { messages: Message[] }
 * - Error (401/500): { error: string }
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

    const { searchParams } = new URL(request.url);
    const chatId = parseInt(searchParams.get('chat_id') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    try {
      let sqlQuery = `
        SELECT 
          m.id,
          m.chat_id,
          m.user_id,
          m.message,
          m.created_at,
          u.username,
          u.profile_photo
        FROM messages m
        INNER JOIN users u ON m.user_id = u.id
        WHERE m.chat_id = $1
      `;

      const params: any[] = [chatId];

      if (before) {
        sqlQuery += ' AND m.created_at < $' + (params.length + 1);
        params.push(before);
      }

      sqlQuery += ' ORDER BY m.created_at DESC LIMIT $' + (params.length + 1);
      params.push(limit);

      const result = await query(sqlQuery, params);

      // Reverse to show oldest first
      const messages = (result.rows || []).reverse().map((row: any) => ({
        id: row.id,
        chatId: row.chat_id,
        userId: row.user_id.toString(),
        username: row.username,
        profilePhoto: row.profile_photo || undefined,
        message: row.message,
        createdAt: row.created_at,
      }));

      return NextResponse.json({ messages });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/messages
 * 
 * Send a chat message
 * 
 * Request body:
 * - message: string (required)
 * - chat_id: number (optional, defaults to 1 for global chat)
 * 
 * Response:
 * - Success (200): { message: Message }
 * - Error (400/401/500): { error: string }
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
    const { message, chat_id } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    const chatId = chat_id || 1;

    try {
      // Insert message and get the created message with user info in one query
      const result = await query(
        `INSERT INTO messages (chat_id, user_id, message) 
         VALUES ($1, $2, $3) 
         RETURNING id, chat_id, user_id, message, created_at`,
        [chatId, userId, message.trim()]
      );

      const messageId = result.rows[0].id;

      // Get the created message with user info
      const messageResult = await query(
        `SELECT 
          m.id,
          m.chat_id,
          m.user_id,
          m.message,
          m.created_at,
          u.username,
          u.profile_photo
        FROM messages m
        INNER JOIN users u ON m.user_id = u.id
        WHERE m.id = $1`,
        [messageId]
      );

      if (!messageResult.rows || messageResult.rows.length === 0) {
        throw new Error('Failed to retrieve created message');
      }

      const row = messageResult.rows[0];
      const createdMessage = {
        id: row.id,
        chatId: row.chat_id,
        userId: row.user_id.toString(),
        username: row.username,
        profilePhoto: row.profile_photo || undefined,
        message: row.message,
        createdAt: row.created_at,
      };

      return NextResponse.json({ message: createdMessage });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}

