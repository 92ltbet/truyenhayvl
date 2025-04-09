import { NextResponse } from 'next/server';
import { getComics } from '@/lib/api';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getComics();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching comics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comics' },
      { status: 500 }
    );
  }
} 