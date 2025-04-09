import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://otruyenapi.com/v1/api/the-loai', {
      headers: {
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch genres');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 