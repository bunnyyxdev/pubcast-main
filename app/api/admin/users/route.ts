import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/admin/users
 * Get all users with pagination
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let sqlQuery = `
      SELECT 
        id,
        username,
        phone_number,
        created_at,
        updated_at,
        COALESCE(banned, false) as banned
      FROM users
    `;
    const params: any[] = [];

    if (search) {
      sqlQuery += ' WHERE username ILIKE $1 OR phone_number ILIKE $1';
      params.push(`%${search}%`);
    }

    sqlQuery += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await query(sqlQuery, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const countParams: any[] = [];
    if (search) {
      countQuery += ' WHERE username ILIKE $1 OR phone_number ILIKE $1';
      countParams.push(`%${search}%`);
    }
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    return NextResponse.json({
      users: result.rows.map((row: any) => ({
        id: row.id,
        username: row.username,
        phoneNumber: row.phone_number,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        banned: row.banned || false,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    );
  }
}

