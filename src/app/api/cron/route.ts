import { NextResponse } from 'next/server';

// Đảm bảo route này chạy trên Edge Runtime
export const runtime = 'edge';
export const dynamic = 'force-dynamic'; // Đảm bảo không bị cache tĩnh

export async function GET(request: Request) {
  // Kiểm tra header bảo mật nếu cần (ví dụ: từ Cloudflare Scheduler)
  // const authorization = request.headers.get('Authorization');
  // if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  console.log('Cron job triggered at:', new Date().toISOString());

  try {
    // === Thêm logic xử lý cron job của bạn ở đây ===
    // Ví dụ:
    // - Gọi một hàm để làm mới cache trên Cloudflare KV hoặc Cache API
    // - Gọi một API khác để cập nhật dữ liệu
    // await refreshDataCache(); 

    // ===============================================

    return NextResponse.json({ success: true, message: 'Cron job executed successfully.' });

  } catch (error) {
    console.error('Error executing cron job:', error);
    // Trả về lỗi 500 nhưng không nên để lộ chi tiết lỗi
    return NextResponse.json(
      { success: false, error: 'Cron job failed.' },
      { status: 500 }
    );
  }
} 