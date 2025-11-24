import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// In-memory queue (in production, use Redis or database)
const queue: any[] = [];

/**
 * GET /api/queue
 * Get queue items
 */
export async function GET(request: NextRequest) {
  try {
    // In production, get from database or Redis
    // For now, return empty queue or mock data
    return NextResponse.json({
      queue: queue.map((item, index) => ({
        ...item,
        position: index + 1,
        estimatedTime: calculateEstimatedTime(index, item.duration),
      })),
    });
  } catch (error) {
    console.error('Get queue error:', error);
    return NextResponse.json(
      { error: 'Failed to get queue' },
      { status: 500 }
    );
  }
}

function calculateEstimatedTime(position: number, duration: number): string {
  // Simple calculation: assume average 30 seconds per item
  const averageDuration = 30;
  const totalSeconds = position * averageDuration + duration;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes} นาที ${seconds} วินาที`;
  }
  return `${seconds} วินาที`;
}

