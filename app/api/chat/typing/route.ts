import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// In-memory store for typing indicators (in production, use Redis or similar)
const typingUsers = new Map<string, { userId: string; username: string; timestamp: number }[]>();

/**
 * POST /api/chat/typing
 * Update typing indicator
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const username = cookieStore.get('username')?.value;

    if (!userId || !username) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { chatId = 1, isTyping } = body;

    const chatKey = `chat_${chatId}`;
    const now = Date.now();

    if (!typingUsers.has(chatKey)) {
      typingUsers.set(chatKey, []);
    }

    const users = typingUsers.get(chatKey)!;

    if (isTyping) {
      // Add or update user
      const existingIndex = users.findIndex(u => u.userId === userId);
      if (existingIndex >= 0) {
        users[existingIndex].timestamp = now;
      } else {
        users.push({ userId, username, timestamp: now });
      }
    } else {
      // Remove user
      const index = users.findIndex(u => u.userId === userId);
      if (index >= 0) {
        users.splice(index, 1);
      }
    }

    // Clean up old entries (older than 3 seconds)
    const filtered = users.filter(u => now - u.timestamp < 3000);
    typingUsers.set(chatKey, filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Typing indicator error:', error);
    return NextResponse.json(
      { error: 'Failed to update typing indicator' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/typing?chat_id=1
 * Get typing users
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chat_id') || '1';

    const chatKey = `chat_${chatId}`;
    const users = typingUsers.get(chatKey) || [];
    const now = Date.now();

    // Filter out old entries
    const activeUsers = users.filter(u => now - u.timestamp < 3000);

    return NextResponse.json({
      users: activeUsers.map(u => u.username),
    });
  } catch (error) {
    console.error('Get typing users error:', error);
    return NextResponse.json(
      { error: 'Failed to get typing users' },
      { status: 500 }
    );
  }
}

