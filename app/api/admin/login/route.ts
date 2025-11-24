import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

/**
 * POST /api/admin/login
 * 
 * Admin login
 * 
 * Request body:
 * - username: string
 * - password: string
 * 
 * Response:
 * - Success (200): { success: true }
 * - Error (401/500): { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      );
    }

    try {
      // Find admin user
      const result = await query(
        'SELECT id, username, password_hash FROM admin_users WHERE username = $1',
        [username]
      );

      if (!result.rows || result.rows.length === 0) {
        return NextResponse.json(
          { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
          { status: 401 }
        );
      }

      const admin = result.rows[0];
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password_hash);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
          { status: 401 }
        );
      }

      // Set admin session cookie
      const cookieStore = await cookies();
      cookieStore.set('admin_session', admin.id.toString(), {
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: 'lax',
        httpOnly: true,
      });

      return NextResponse.json({
        success: true,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}

