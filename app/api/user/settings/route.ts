import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/user/settings
 * Get user settings
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

    const result = await query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [parseInt(userId)]
    );

    if (result.rows.length === 0) {
      // Return default settings
      return NextResponse.json({
        settings: {
          theme: 'dark',
          language: 'th',
          notificationsEnabled: true,
          privacyShowProfile: true,
          privacyShowActivity: true,
        },
      });
    }

    const settings = result.rows[0];
    return NextResponse.json({
      settings: {
        theme: settings.theme || 'dark',
        language: settings.language || 'th',
        notificationsEnabled: settings.notifications_enabled ?? true,
        privacyShowProfile: settings.privacy_show_profile ?? true,
        privacyShowActivity: settings.privacy_show_activity ?? true,
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/settings
 * Update user settings
 */
export async function PUT(request: NextRequest) {
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
    const { theme, language, notificationsEnabled, privacyShowProfile, privacyShowActivity } = body;

    // Upsert settings
    await query(
      `INSERT INTO user_settings (user_id, theme, language, notifications_enabled, privacy_show_profile, privacy_show_activity)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         theme = EXCLUDED.theme,
         language = EXCLUDED.language,
         notifications_enabled = EXCLUDED.notifications_enabled,
         privacy_show_profile = EXCLUDED.privacy_show_profile,
         privacy_show_activity = EXCLUDED.privacy_show_activity,
         updated_at = CURRENT_TIMESTAMP`,
      [
        parseInt(userId),
        theme || 'dark',
        language || 'th',
        notificationsEnabled ?? true,
        privacyShowProfile ?? true,
        privacyShowActivity ?? true,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

