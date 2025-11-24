import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

interface RegisterRequest {
  username: string;
  phoneNumber: string;
}

/**
 * POST /api/auth/register
 * 
 * Register a new user account
 * 
 * Request body:
 * - username: string - Account username (unique)
 * - phoneNumber: string - Phone number
 * 
 * Response:
 * - Success (200): { success: true, user: { id, username, phoneNumber } }
 * - Error (400/500): { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterRequest;
    const { username, phoneNumber } = body;

    // Validation
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json(
        { error: 'ชื่อบัญชี (username) จำเป็นต้องกรอก' },
        { status: 400 }
      );
    }

    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
      return NextResponse.json(
        { error: 'เบอร์โทรศัพท์ (phone number) จำเป็นต้องกรอก' },
        { status: 400 }
      );
    }

    // Validate phone number format (Thai phone: 10 digits starting with 0)
    const cleanedPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!/^0\d{9}$/.test(cleanedPhone)) {
      return NextResponse.json(
        { error: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็น 10 หลัก ขึ้นต้นด้วย 0)' },
        { status: 400 }
      );
    }

    // Validate username (alphanumeric, 3-20 characters)
    const cleanedUsername = username.trim();
    if (cleanedUsername.length < 3 || cleanedUsername.length > 20) {
      return NextResponse.json(
        { error: 'ชื่อบัญชีต้องมีความยาว 3-20 ตัวอักษร' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanedUsername)) {
      return NextResponse.json(
        { error: 'ชื่อบัญชีสามารถใช้ได้เฉพาะตัวอักษร ตัวเลข และ _ เท่านั้น' },
        { status: 400 }
      );
    }

    try {
      // Check if username exists
      const existingUser = await query(
        'SELECT id FROM users WHERE username = $1',
        [cleanedUsername]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'ชื่อบัญชีนี้ถูกใช้งานแล้ว' },
          { status: 400 }
        );
      }

      // Check if phone number exists
      const existingPhone = await query(
        'SELECT id FROM users WHERE phone_number = $1',
        [cleanedPhone]
      );

      if (existingPhone.rows.length > 0) {
        return NextResponse.json(
          { error: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' },
          { status: 400 }
        );
      }

      // Insert new user
      const result = await query(
        'INSERT INTO users (username, phone_number) VALUES ($1, $2) RETURNING id',
        [cleanedUsername, cleanedPhone]
      );

      const userId = result.rows[0].id;

      // Set cookies on server side
      const cookieStore = await cookies();
      cookieStore.set('user_id', userId.toString(), {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
        httpOnly: false, // Allow client-side access
      });
      cookieStore.set('username', cleanedUsername, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
      });
      cookieStore.set('phone_number', cleanedPhone, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
      });

      return NextResponse.json({
        success: true,
        user: {
          id: userId.toString(),
          username: cleanedUsername,
          phoneNumber: cleanedPhone,
        },
      });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      
      // Handle duplicate entry errors (PostgreSQL unique violation)
      if (dbError.code === '23505') {
        if (dbError.constraint?.includes('username')) {
          return NextResponse.json(
            { error: 'ชื่อบัญชีนี้ถูกใช้งานแล้ว' },
            { status: 400 }
          );
        } else if (dbError.constraint?.includes('phone_number')) {
          return NextResponse.json(
            { error: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' },
            { status: 400 }
          );
        }
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
      { status: 500 }
    );
  }
}

