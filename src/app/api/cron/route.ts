import { NextResponse } from 'next/server';
import { getHome } from '@/lib/api';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Running cron job at:', new Date().toLocaleString());
    await getHome();
    return NextResponse.json({ success: true, message: 'Cron job completed successfully' });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 