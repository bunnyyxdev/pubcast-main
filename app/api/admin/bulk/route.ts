import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * POST /api/admin/bulk
 * Perform bulk operations
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { operation, target, ids } = body;

    if (!operation || !target || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    let affected = 0;

    if (target === 'users') {
      if (operation === 'ban') {
        for (const id of ids) {
          await query('UPDATE users SET banned = true WHERE id = $1', [id]);
          affected++;
        }
      } else if (operation === 'unban') {
        for (const id of ids) {
          await query('UPDATE users SET banned = false WHERE id = $1', [id]);
          affected++;
        }
      } else if (operation === 'delete') {
        for (const id of ids) {
          await query('DELETE FROM messages WHERE user_id = $1', [id]);
          await query('DELETE FROM payments WHERE user_id = $1', [id]);
          await query('DELETE FROM users WHERE id = $1', [id]);
          affected++;
        }
      }
    } else if (target === 'messages') {
      if (operation === 'delete') {
        for (const id of ids) {
          await query('DELETE FROM messages WHERE id = $1', [id]);
          affected++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      affected,
      operation,
      target,
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

