import { getComicDetail, getChapterImages } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import './style.css';
import ChapterImage from '@/components/ChapterImage';
import ChapterListPopup from '@/components/ChapterListPopup';
import ChapterSelector from '@/components/ChapterSelector';

interface ChapterPageProps {
  params: {
    slug: string;
    chapter: string;
  };
}

interface ChapterImage {
  image_page: number;
  image_file: string;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  try {
    // Lấy thông tin truyện để lấy chapter API data
    const { data: comicData } = await getComicDetail(params.slug);
    const comic = comicData.item;
    
    // Tìm chapter tương ứng
    const chapterData = comic.chapters[0].server_data.find(
      (chap: { chapter_name: string }) => chap.chapter_name === params.chapter
    );

    if (!chapterData) {
      notFound();
    }

    // Lấy hình ảnh chương
    const chapterResponse = await getChapterImages(chapterData.chapter_api_data);
    
    if (!chapterResponse || !chapterResponse.data || !chapterResponse.data.item) {
      console.error('Invalid chapter data:', chapterResponse);
      notFound();
    }
    
    const chapter = chapterResponse.data.item;
    const domainCDN = chapterResponse.data.domain_cdn || 'https://img.otruyenapi.com';

    // Tìm chapter trước và sau
    const currentChapterIndex = comic.chapters[0].server_data.findIndex(
      (chap: { chapter_name: string }) => chap.chapter_name === params.chapter
    );
    
    // Sắp xếp chương theo thứ tự tăng dần (1 -> 2 -> 3)
    const sortedChapters = [...comic.chapters[0].server_data].sort((a, b) => {
      return parseInt(a.chapter_name) - parseInt(b.chapter_name);
    });
    
    // Chương trước là chương có số nhỏ hơn (chỉ số nhỏ hơn)
    const prevChapter = currentChapterIndex > 0 
      ? sortedChapters[currentChapterIndex - 1] 
      : null;
      
    // Chương tiếp là chương có số lớn hơn (chỉ số lớn hơn)
    const nextChapter = currentChapterIndex < sortedChapters.length - 1 
      ? sortedChapters[currentChapterIndex + 1] 
      : null;

    // Lưu lịch sử đọc
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comic: comicData,
          chapter: {
            name: chapterData.chapter_name,
            slug: params.chapter,
          },
        }),
      });
    } catch (error) {
      console.error('Error saving reading history:', error);
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        {/* Header */}
        <div className="mt-3 md:mt-4">
          <div className="bg-gray-800/90 py-2 sm:py-3 px-3 sm:px-4 border-b border-white/10">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Nút chương trước */}
                {prevChapter && (
                  <Link 
                    href={`/truyen/${comic.slug}/chapter/${prevChapter.chapter_name}`}
                    className="p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                    title={`Chương trước: ${prevChapter.chapter_name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left w-4 h-4 sm:w-5 sm:h-5">
                      <path d="m15 18-6-6 6-6"></path>
                    </svg>
                  </Link>
                )}
                
                {/* Dropdown chọn chương */}
                <div className="relative">
                  <button className="flex items-center justify-between px-3 py-1.5 sm:py-2 min-w-[130px] sm:min-w-[180px] bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-xs sm:text-sm">
                    <span className="mr-1 font-medium">Chương {chapterData.chapter_name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-3 h-3 sm:w-4 sm:h-4 text-gray-300">
                      <path d="m6 9 6 6 6-6"></path>
                    </svg>
                  </button>
                </div>
                
                {/* Nút chương sau */}
                {nextChapter ? (
                  <Link 
                    href={`/truyen/${comic.slug}/chapter/${nextChapter.chapter_name}`}
                    className="p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                    title={`Chương sau: ${nextChapter.chapter_name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-4 h-4 sm:w-5 sm:h-5">
                      <path d="m9 18 6-6-6-6"></path>
                    </svg>
                  </Link>
                ) : (
                  <button disabled className="p-1.5 sm:p-2 bg-gray-700/50 text-gray-500 rounded-md cursor-not-allowed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-4 h-4 sm:w-5 sm:h-5">
                      <path d="m9 18 6-6-6-6"></path>
                    </svg>
                  </button>
                )}
              </div>

              {/* Thông tin truyện và link trở về */}
              <div className="flex items-center space-x-3">
                <Link 
                  href={`/truyen/${comic.slug}`}
                  className="text-sm text-gray-300 hover:text-pink-400 transition-colors"
                >
                  {comic.name}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung chương */}
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {comic.name}
            </h1>
            <div className="text-xl font-medium text-pink-400">
              Chương {chapterData.chapter_name}
            </div>
          </div>
          
          <div className="space-y-0">
            {chapter.chapter_image && chapter.chapter_image.map((image: ChapterImage, index: number) => {
              const imagePath = `/${chapter.chapter_path}/${image.image_file}`;
              const imageUrl = `${domainCDN}${imagePath}`;
              const altText = `${chapter.comic_name} - Chương ${chapter.chapter_name} - Trang ${index + 1}`;
              
              return (
                <ChapterImage 
                  key={index}
                  imageUrl={imageUrl}
                  alt={altText}
                  isEager={index < 3}
                />
              );
            })}
          </div>
          
          {/* Điều hướng cuối trang */}
          <div className="mt-8 md:mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {prevChapter && (
              <Link 
                href={`/truyen/${comic.slug}/chapter/${prevChapter.chapter_name}`} 
                className="flex-1 sm:flex-none px-2 sm:px-4 md:px-6 py-2 md:py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 transition-opacity text-white font-medium text-center text-sm md:text-base"
              >
                Chương trước
              </Link>
            )}
            
            <ChapterListPopup
              chapters={comic.chapters[0].server_data}
              currentChapter={params.chapter}
              comicSlug={params.slug}
            />
            
            {nextChapter && (
              <Link 
                href={`/truyen/${comic.slug}/chapter/${nextChapter.chapter_name}`} 
                className="flex-1 sm:flex-none px-2 sm:px-4 md:px-6 py-2 md:py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 transition-opacity text-white font-medium text-center text-sm md:text-base"
              >
                Chương tiếp
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading chapter:', error);
    notFound();
  }
} 