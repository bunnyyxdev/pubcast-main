import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/admin/check
 * Check if admin is authenticated
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;

    if (!adminSession) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    try {
      const result = await query(
        'SELECT id, username FROM admin_users WHERE id = $1',
        [adminSession]
      );

      if (!result.rows || result.rows.length === 0) {
        return NextResponse.json(
          { authenticated: false },
          { status: 401 }
        );
      }

      return NextResponse.json({
        authenticated: true,
        admin: {
          id: result.rows[0].id,
          username: result.rows[0].username,
        },
      });
    } catch (dbError) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}

