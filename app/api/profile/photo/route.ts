import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * PUT /api/profile/photo
 * 
 * Update user profile photo
 * 
 * Request body:
 * - profilePhoto: string - Base64 encoded image or image URL
 * 
 * Response:
 * - Success (200): { success: true, profilePhoto: string }
 * - Error (400/500): { error: string }
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
    const { profilePhoto } = body;

    // Allow null to remove photo, but if provided, must be string
    if (profilePhoto !== null && profilePhoto !== undefined) {
      if (typeof profilePhoto !== 'string') {
        return NextResponse.json(
          { error: 'Profile photo must be a string or null' },
          { status: 400 }
        );
      }

      // Validate base64 image format (basic check)
      if (profilePhoto.startsWith('data:image/')) {
        // Validate it's a reasonable size (max 2MB)
        const base64Data = profilePhoto.split(',')[1];
        if (base64Data) {
          const sizeInBytes = (base64Data.length * 3) / 4;
          if (sizeInBytes > 2 * 1024 * 1024) {
            return NextResponse.json(
              { error: 'Image size must be less than 2MB' },
              { status: 400 }
            );
          }
        }
      }
    }

    try {
      // Update the profile photo (PostgreSQL uses TEXT which is sufficient)
      await query(
        'UPDATE users SET profile_photo = $1 WHERE id = $2',
        [profilePhoto, userId]
      );

      return NextResponse.json({
        success: true,
        profilePhoto: profilePhoto,
      });
    } catch (dbError: any) {
      console.error('Database error details:', dbError);
      // Return more detailed error message
      const errorMessage = dbError?.message || 'Database error';
      throw new Error(`Database error: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error updating profile photo:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update profile photo' 
      },
      { status: 500 }
    );
  }
}

