import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const history = cookieStore.get('reading_history');
    
    if (!history) {
      return NextResponse.json({ data: [] });
    }

    const historyData = JSON.parse(history.value);
    return NextResponse.json({ data: historyData });
  } catch (error) {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const body = await request.json();
    
    const history = cookieStore.get('reading_history');
    let historyData = [];
    
    if (history) {
      historyData = JSON.parse(history.value);
    }
    
    // Kiểm tra xem chapter đã tồn tại trong lịch sử chưa
    const existingIndex = historyData.findIndex(
      (item: any) => 
        item.comic._id === body.comic._id && 
        item.chapter.slug === body.chapter.slug
    );
    
    if (existingIndex !== -1) {
      // Cập nhật timestamp nếu đã tồn tại
      historyData[existingIndex].timestamp = Date.now();
    } else {
      // Thêm mới vào đầu danh sách
      historyData.unshift({
        ...body,
        timestamp: Date.now()
      });
      
      // Giới hạn số lượng item trong lịch sử
      if (historyData.length > 20) {
        historyData = historyData.slice(0, 20);
      }
    }
    
    // Lưu vào cookie
    cookieStore.set('reading_history', JSON.stringify(historyData), {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 ngày
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 