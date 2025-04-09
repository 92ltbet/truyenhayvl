import React from 'react';
import Image from 'next/image';
import { getComicDetail, getChapterImages } from '@/lib/api';
import { ChapterImages } from '@/types/comic';
import ChapterHeader from '@/components/ChapterHeader';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface ChapterPageProps {
  params: {
    slug: string;
    chapter: string;
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  try {
    // Lấy thông tin truyện để lấy chapter API data
    const { data: comicData } = await getComicDetail(params.slug);
    const comic = comicData.item;
    
    // Kiểm tra xem có chapter nào không
    const hasChapters = comic.chapters && comic.chapters.length > 0 && 
                        comic.chapters[0] && comic.chapters[0].server_data && 
                        comic.chapters[0].server_data.length > 0;
    
    if (!hasChapters) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
          <header className="bg-gray-900 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <Link href={`/truyen/${params.slug}`} className="flex items-center space-x-2 text-gray-300 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Quay lại trang truyện</span>
              </Link>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl font-bold mb-6">Truyện chưa có chapter nào</h1>
              <p className="text-gray-400 mb-8">Vui lòng quay lại sau khi truyện được cập nhật.</p>
              <Link 
                href={`/truyen/${params.slug}`}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg inline-block"
              >
                Quay lại trang truyện
              </Link>
            </div>
          </main>
          
          <Footer />
        </div>
      );
    }
    
    // Tìm chapter tương ứng
    const chapterData = comic.chapters[0].server_data.find(
      (chap: { chapter_name: string }) => chap.chapter_name === params.chapter
    );

    if (!chapterData) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
          <header className="bg-gray-900 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <Link href={`/truyen/${params.slug}`} className="flex items-center space-x-2 text-gray-300 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Quay lại trang truyện</span>
              </Link>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl font-bold mb-6">Không tìm thấy chương {params.chapter}</h1>
              <p className="text-gray-400 mb-8">Chương bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
              <Link 
                href={`/truyen/${params.slug}`}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg inline-block"
              >
                Quay lại trang truyện
              </Link>
            </div>
          </main>
          
          <Footer />
        </div>
      );
    }

    // Lấy hình ảnh chương
    const { data } = await getChapterImages(chapterData.chapter_api_data);
    const chapter = data.item as ChapterImages['item'];

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <ChapterHeader comic={comic} currentChapter={params.chapter} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                {chapter.comic_name}
              </h1>
              <p className="text-xl text-gray-300">
                Chương {chapter.chapter_name}
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button className="px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm hover:bg-pink-500/30 transition-colors border border-white/10">
                Chương trước
              </button>
              <button className="px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm hover:bg-pink-500/30 transition-colors border border-white/10">
                Chương sau
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            {chapter.chapter_image.map((image) => (
              <div
                key={image.image_page}
                className="relative h-[800px] w-full max-w-4xl rounded-lg overflow-hidden shadow-lg"
              >
                <Image
                  src={`${data.domain_cdn}/${chapter.chapter_path}/${image.image_file}`}
                  alt={`Trang ${image.image_page + 1}`}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.jpg';
                  }}
                />
              </div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error loading chapter:', error);
    notFound();
  }
} 