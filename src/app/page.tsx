import { Suspense } from 'react';
import { getHome, getAllPages } from "../lib/api";
import Footer from "../components/Footer";
import ComicCard from "../components/ComicCard";
import ComicCarousel from "../components/ComicCarousel";
import ReadingHistory from "../components/ReadingHistory";
import { Comic } from "../types/comic";
import Image from 'next/image';
import LoadingSection from "../components/LoadingSection";

const categories = [
  { slug: 'manhua', name: 'Manhua' },
  { slug: 'xuyen-khong', name: 'Xuyên Không' },
  { slug: 'chuyen-sinh', name: 'Chuyển Sinh' },
  { slug: 'manga', name: 'Manga' },
  { slug: 'comic', name: 'Comic' },
  { slug: 'fantasy', name: 'Fantasy' }
];

export default async function Home() {
  const { data: homeData } = await getHome();
  console.log('Home data:', homeData);
  const featuredComics = homeData.items.slice(0, 12);
  const latestComics = homeData.items.slice(0, 24);
  console.log('Number of latest comics:', latestComics.length);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-[1030px]">
        <ReadingHistory />
        
        {/* Featured Comics - Slider */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Truyện Nổi Bật</h2>
          <Suspense fallback={<LoadingSection />}>
            <div className="w-full relative overflow-hidden rounded-lg">
              <ComicCarousel comics={featuredComics} />
            </div>
          </Suspense>
        </section>

        {/* Truyện mới cập nhật */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Truyện mới cập nhật</h2>
          <Suspense fallback={<LoadingSection />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
              {latestComics.map((comic: Comic) => (
                <ComicCard key={comic._id} comic={comic} />
              ))}
            </div>
          </Suspense>
        </section>

        {/* Các chuyên mục */}
        {categories.map(async (category) => {
          const allComics = await getAllPages(`https://otruyenapi.com/v1/api/the-loai/${category.slug}`);
          return (
            <section key={category.slug} className="mb-8 md:mb-12">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold">{category.name}</h2>
                <a href={`/the-loai/${category.slug}`} className="text-pink-500 hover:text-pink-400 text-sm md:text-base">
                  Xem tất cả
                </a>
              </div>
              <Suspense fallback={<LoadingSection />}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
                  {allComics.slice(0, 6).map((comic: Comic) => (
                    <ComicCard key={comic._id} comic={comic} />
                  ))}
                </div>
              </Suspense>
            </section>
          );
        })}
      </div>

      <Footer />
    </main>
  );
} 
