import ComicImage from '@/components/ComicImage';
import { getImageUrl } from '@/lib/imageUtils';
import { cookies } from 'next/headers';
import { getComicDetail } from '@/lib/api';
import FollowButton from '@/components/FollowButton';
import Link from 'next/link';
import SortButton from '@/components/SortButton';
import ChapterJumpForm from '@/components/ChapterJumpForm';

interface ComicPageProps {
  params: {
    slug: string;
  };
}

// Form action cho theo dõi truyện
async function followComic(formData: FormData): Promise<void> {
  'use server';
  const comicId = formData.get('comicId')?.toString() || '';
  const comicName = formData.get('comicName')?.toString() || '';
  const comicSlug = formData.get('comicSlug')?.toString() || '';
  const comicThumb = formData.get('comicThumb')?.toString() || '';
  
  const cookieStore = cookies();
  const followedComics = JSON.parse(cookieStore.get('followed_comics')?.value || '[]');
  
  // Kiểm tra xem truyện đã được theo dõi chưa
  const existingIndex = followedComics.findIndex((comic: any) => comic.id === comicId);
  
  if (existingIndex === -1) {
    // Thêm truyện mới vào danh sách theo dõi
    followedComics.push({
      id: comicId,
      name: comicName,
      slug: comicSlug,
      thumb: comicThumb
    });
  } else {
    // Xóa truyện khỏi danh sách theo dõi
    followedComics.splice(existingIndex, 1);
  }
  
  // Lưu danh sách mới vào cookie
  cookieStore.set('followed_comics', JSON.stringify(followedComics), {
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 ngày
  });
}

export default async function ComicPage({ params }: ComicPageProps) {
  const response = await getComicDetail(params.slug);
  
  if (!response || !response.data || !response.data.item) {
    return <div>Không tìm thấy truyện</div>;
  }
  
  const comic = response.data.item;
  const cookieStore = cookies();
  const followedComics = JSON.parse(cookieStore.get('followed_comics')?.value || '[]');
  const isFollowing = followedComics.some((c: any) => c.id === comic._id);

  // Lấy server_data từ chapters nếu có
  const serverData = comic.chapters?.[0]?.server_data || [];
  const hasChapters = serverData && serverData.length > 0;
  
  // Sắp xếp chương theo thứ tự tăng dần (1 -> 2 -> 3)
  const sortedChapters = [...serverData].sort((a, b) => {
    return parseInt(a.chapter_name) - parseInt(b.chapter_name);
  });
  
  // Tìm chapter đầu tiên và cuối cùng
  const firstChapter = sortedChapters[0];
  const lastChapter = sortedChapters[sortedChapters.length - 1];
  
  // Xây dựng URL ảnh đầy đủ
  const imageBaseUrl = response.data.APP_DOMAIN_CDN_IMAGE || 'https://img.otruyenapi.com';
  const thumbUrl = comic.thumb_url ? `${imageBaseUrl}/uploads/comics/${comic.thumb_url}` : '/images/placeholder.jpg';

  // Lấy thông tin chương đã đọc từ cookie
  const readingHistory = JSON.parse(cookieStore.get('reading_history')?.value || '{}');
  const comicReadingHistory = readingHistory[comic._id] || {};
  const lastReadChapter = comicReadingHistory.lastChapter;
  
  // Tính số chương mới chưa đọc
  let unreadChapters = 0;
  if (lastReadChapter && hasChapters) {
    unreadChapters = serverData.findIndex((chapter: { chapter_name: string }) => chapter.chapter_name === lastReadChapter);
    unreadChapters = unreadChapters >= 0 ? unreadChapters : 0;
  }

  // Tổng số chương
  const totalChapters = serverData.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header với breadcrumb */}
        <div className="mb-6 flex items-center text-gray-400 text-sm">
          <Link href="/" className="hover:text-pink-400 transition-colors">Trang chủ</Link>
          <span className="mx-2">›</span>
          {comic.category && comic.category[0] && (
            <>
              <Link href={`/the-loai/${comic.category[0].slug}`} className="hover:text-pink-400 transition-colors">
                {comic.category[0].name}
              </Link>
              <span className="mx-2">›</span>
            </>
          )}
          <span className="text-gray-300 truncate">{comic.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Comic Cover */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-[0_0_15px_rgba(255,105,180,0.3)] group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              <ComicImage 
                src={thumbUrl} 
                alt={comic.name}
                priority
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              {totalChapters > 0 && (
                <div className="absolute bottom-3 right-3 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  {totalChapters} chương
                </div>
              )}
              <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium px-2 py-1 rounded-full z-10">
                {comic.status === 'ongoing' ? 'Đang cập nhật' : 'Hoàn thành'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <FollowButton
                comicId={comic._id}
                comicName={comic.name}
                comicSlug={comic.slug}
                comicThumb={thumbUrl}
                isFollowing={isFollowing}
                onFollow={followComic}
              />
              
              {hasChapters ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href={`/truyen/${comic.slug}/chapter/${firstChapter.chapter_name}`}
                    className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Đọc từ đầu
                  </Link>
                  <Link 
                    href={`/truyen/${comic.slug}/chapter/${lastChapter.chapter_name}`}
                    className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 text-sm"
                  >
                    Mới nhất
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="py-3 text-center text-gray-400 bg-gray-800/50 rounded-lg">
                  Truyện chưa có chương
                </div>
              )}
              
              {/* Chuyển đến chương */}
              {hasChapters && (
                <ChapterJumpForm 
                  comicSlug={comic.slug}
                  firstChapter={firstChapter.chapter_name}
                  lastChapter={lastChapter.chapter_name}
                />
              )}
            </div>

            {/* Comic Info */}
            <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 space-y-3 text-sm border border-gray-700/50">
              <div className="flex justify-between">
                <span className="text-gray-400">Tác giả:</span>
                <span className="text-right font-medium">
                  {comic.author && comic.author.length > 0 
                    ? (Array.isArray(comic.author) ? comic.author.join(', ') : comic.author)
                    : 'Đang cập nhật'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Tình trạng:</span>
                <span className="text-right font-medium">
                  {comic.status === 'ongoing' ? 'Đang cập nhật' : 'Hoàn thành'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Độc quyền:</span>
                <span className="text-right font-medium">
                  {comic.sub_docquyen ? 'Có' : 'Không'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Cập nhật:</span>
                <span className="text-right font-medium">
                  {new Date(comic.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              
              {lastReadChapter && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Đã đọc:</span>
                  <Link 
                    href={`/truyen/${comic.slug}/chapter/${lastReadChapter}`}
                    className="text-right font-medium text-pink-400 hover:text-pink-300"
                  >
                    Chương {lastReadChapter}
                  </Link>
                </div>
              )}
              
              {unreadChapters > 0 && (
                <div className="mt-3 py-2 px-3 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-lg border border-pink-500/30 text-center">
                  <span className="text-pink-400 font-medium">Có {unreadChapters} chương mới chưa đọc</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Comic Details */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              {comic.name}
            </h1>
            
            {comic.origin_name && comic.origin_name.length > 0 && (
              <p className="mt-1 text-gray-400 text-sm italic">
                {Array.isArray(comic.origin_name) ? comic.origin_name.join(', ') : comic.origin_name}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {comic.category && comic.category.length > 0 && comic.category.map((genre: any) => (
                <Link 
                  key={genre.id} 
                  href={`/the-loai/${genre.slug}`}
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs hover:bg-gray-700 hover:text-pink-400 transition-colors"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-bold mb-3 flex items-center">
                <span className="inline-block w-1 h-6 bg-gradient-to-b from-pink-500 to-purple-600 rounded-full mr-2"></span>
                Nội dung
              </h2>
              <div className="text-gray-300 text-sm md:text-base bg-gray-800/40 border border-gray-700/50 backdrop-blur-sm rounded-lg p-4" 
                   dangerouslySetInnerHTML={{ __html: comic.content || 'Đang cập nhật...' }} />
            </div>

            {hasChapters && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="inline-block w-1 h-6 bg-gradient-to-b from-pink-500 to-purple-600 rounded-full mr-2"></span>
                    Danh sách chương
                  </div>
                  <div className="flex items-center space-x-3">
                    <SortButton />
                    <span className="text-sm text-pink-400 font-medium">
                      {serverData.length} chương
                    </span>
                  </div>
                </h2>
                
                {/* Chapter Grid - Desktop */}
                <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {serverData.map((chapter: { chapter_name: string; chapter_title?: string }, index: number) => (
                    <Link 
                      key={chapter.chapter_name || index} 
                      href={`/truyen/${comic.slug}/chapter/${chapter.chapter_name}`}
                      className={`bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700/80 border ${
                        lastReadChapter === chapter.chapter_name
                          ? 'border-pink-500/50'
                          : lastReadChapter && Number(chapter.chapter_name) > Number(lastReadChapter)
                          ? 'border-green-500/30'
                          : 'border-gray-700/30'
                      } rounded-lg px-4 py-3 transition-colors relative`}
                    >
                      <span className="font-medium">Chương {chapter.chapter_name}</span>
                      {chapter.chapter_title && (
                        <span className="block text-sm text-gray-400 truncate mt-1">{chapter.chapter_title}</span>
                      )}
                      
                      {lastReadChapter === chapter.chapter_name && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></div>
                      )}
                      
                      {lastReadChapter && Number(chapter.chapter_name) > Number(lastReadChapter) && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Chapter List - Mobile */}
                <div className="md:hidden">
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700/30">
                    {serverData.map((chapter: { chapter_name: string; chapter_title?: string }, index: number) => (
                      <Link 
                        key={chapter.chapter_name || index} 
                        href={`/truyen/${comic.slug}/chapter/${chapter.chapter_name}`}
                        className={`flex items-center justify-between py-3 px-4 border-b border-gray-700/30 last:border-0 hover:bg-gray-700/50 transition-colors ${
                          lastReadChapter === chapter.chapter_name
                            ? 'bg-pink-900/20'
                            : lastReadChapter && Number(chapter.chapter_name) > Number(lastReadChapter)
                            ? 'bg-green-900/10'
                            : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="font-medium">Chương {chapter.chapter_name}</span>
                          {lastReadChapter === chapter.chapter_name && (
                            <span className="ml-2 text-xs text-pink-400">(Đã đọc)</span>
                          )}
                          {lastReadChapter && Number(chapter.chapter_name) > Number(lastReadChapter) && (
                            <span className="ml-2 text-xs text-green-400">(Mới)</span>
                          )}
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}