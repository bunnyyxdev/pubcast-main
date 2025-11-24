import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * DELETE /api/admin/chat/delete
 * 
 * Delete a chat message (Admin only)
 * 
 * Query params:
 * - message_id: number (required)
 * 
 * Response:
 * - Success (200): { success: true, message: string }
 * - Error (400/401/404/500): { error: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Not authenticated as admin' },
        { status: 401 }
      );
    }

    // Verify admin session
    const adminCheck = await query(
      'SELECT id FROM admin_users WHERE id = $1',
      [adminSession]
    );

    if (!adminCheck.rows || adminCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Not authenticated as admin' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('message_id');

    if (!messageId || isNaN(parseInt(messageId))) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    try {
      // Check if the message exists
      const checkResult = await query(
        `SELECT id FROM messages WHERE id = $1`,
        [parseInt(messageId)]
      );

      if (!checkResult.rows || checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }

      // Delete the message
      await query(
        `DELETE FROM messages WHERE id = $1`,
        [parseInt(messageId)]
      );

      return NextResponse.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete message' },
      { status: 500 }
    );
  }
}

