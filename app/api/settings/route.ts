import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/settings
 * Get public settings (services and promo text)
 */
export async function GET(request: NextRequest) {
  try {
    const result = await query(
      'SELECT setting_key, setting_value FROM settings WHERE setting_key IN ($1, $2, $3)',
      ['services', 'promo_text', 'promo_subtext']
    );

    const settingsObj: Record<string, any> = {};
    result.rows.forEach((setting: any) => {
      try {
        settingsObj[setting.setting_key] = JSON.parse(setting.setting_value);
      } catch {
        settingsObj[setting.setting_key] = setting.setting_value;
      }
    });

    // Convert services object to array format (for compatibility with existing code)
    let servicesArray: any[] = [];
    if (settingsObj.services) {
      servicesArray = Object.values(settingsObj.services);
    }

    return NextResponse.json({
      services: servicesArray,
      servicesObj: settingsObj.services, // Also return as object for flexibility
      promoText: settingsObj.promo_text || "",
      promoSubtext: settingsObj.promo_subtext || "",
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

