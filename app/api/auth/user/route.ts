import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/auth/user
 * 
 * Get current user information from session
 * 
 * Response:
 * - Success (200): { user: { id, username, phoneNumber } }
 * - Not logged in (401): { error: 'Not authenticated' }
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from cookie/session
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const username = cookieStore.get('username')?.value;
    const phoneNumber = cookieStore.get('phone_number')?.value;

    if (!userId || !username) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    try {
      // Check if profile_photo column exists by trying to query it
      let hasProfilePhotoColumn = true;
      let result;
      
      try {
        result = await query(
          'SELECT id, username, phone_number, profile_photo FROM users WHERE id = $1',
          [userId]
        );
      } catch (e: any) {
        // If column doesn't exist, try without it
        if (e.message?.includes('column') || e.code === '42703') {
          hasProfilePhotoColumn = false;
          result = await query(
            'SELECT id, username, phone_number FROM users WHERE id = $1',
            [userId]
          );
        } else {
          throw e;
        }
      }

      if (!result.rows || result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = result.rows[0];
      return NextResponse.json({
        user: {
          id: user.id.toString(),
          username: user.username,
          phoneNumber: user.phone_number,
          profilePhoto: hasProfilePhotoColumn ? (user.profile_photo || undefined) : undefined,
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Fallback to cookies if database fails
      return NextResponse.json({
        user: {
          id: userId,
          username: username,
          phoneNumber: phoneNumber || '',
          profilePhoto: undefined,
        },
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    );
  }
}

