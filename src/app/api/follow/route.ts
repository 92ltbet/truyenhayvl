import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const followedComics = cookieStore.get('followed_comics')?.value || '[]';
  return NextResponse.json(JSON.parse(followedComics));
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const formData = await request.formData();
  
  const comicId = formData.get('comicId');
  const comicName = formData.get('comicName');
  const comicSlug = formData.get('comicSlug');
  const comicThumb = formData.get('comicThumb');
  
  const followedComics = JSON.parse(cookieStore.get('followed_comics')?.value || '[]');
  
  // Kiểm tra xem truyện đã được theo dõi chưa
  const existingIndex = followedComics.findIndex((comic: any) => comic.id === comicId);
  let message = '';
  
  if (existingIndex === -1) {
    // Thêm truyện mới vào danh sách theo dõi
    followedComics.push({
      id: comicId,
      name: comicName,
      slug: comicSlug,
      thumb: comicThumb
    });
    message = `Đã theo dõi truyện ${comicName}`;
  } else {
    // Xóa truyện khỏi danh sách theo dõi
    followedComics.splice(existingIndex, 1);
    message = `Đã bỏ theo dõi truyện ${comicName}`;
  }
  
  // Lưu danh sách mới vào cookie
  cookieStore.set('followed_comics', JSON.stringify(followedComics), {
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 ngày
  });
  
  return NextResponse.json({ 
    success: true,
    message,
    followedComics 
  });
} 