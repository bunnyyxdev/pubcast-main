import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * GET /api/admin/settings
 * Get all settings
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    try {
      const result = await query(
        'SELECT setting_key, setting_value FROM settings'
      );

      const settingsObj: Record<string, any> = {};
      result.rows.forEach((setting: any) => {
        try {
          settingsObj[setting.setting_key] = JSON.parse(setting.setting_value);
        } catch {
          settingsObj[setting.setting_key] = setting.setting_value;
        }
      });

      return NextResponse.json({
        success: true,
        settings: settingsObj,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Update settings
 */
export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { services, promo_text, promo_subtext } = body;

    try {
      // Update services
      if (services) {
        await query(
          'INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2',
          ['services', JSON.stringify(services)]
        );
      }

      // Update promo text
      if (promo_text !== undefined) {
        await query(
          'INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2',
          ['promo_text', promo_text]
        );
      }

      // Update promo subtext
      if (promo_subtext !== undefined) {
        await query(
          'INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2',
          ['promo_subtext', promo_subtext]
        );
      }

      return NextResponse.json({
        success: true,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}

