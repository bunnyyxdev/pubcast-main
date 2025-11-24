import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * POST /api/user/activity
 * 
 * Update user's last seen timestamp
 * Called when user visits any page
 * 
 * Response:
 * - Success (200): { success: true }
 * - Error (401/500): { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false },
        { status: 200 } // Don't return error, just silently fail
      );
    }

    try {
      // Update user's updated_at timestamp to track activity
      await query(
        `UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [parseInt(userId)]
      );

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Don't throw error, just return success to avoid breaking user experience
      return NextResponse.json({ success: false });
    }
  } catch (error) {
    // Silently fail to avoid breaking user experience
    return NextResponse.json({ success: false });
  }
}

