import React from 'react';
import Image from 'next/image';
import { getComicDetail } from '@/lib/api';
import { Comic } from '@/types/comic';

interface ComicPageProps {
  params: {
    slug: string;
  };
}

export default async function ComicPage({ params }: ComicPageProps) {
  const { data } = await getComicDetail(params.slug);
  const comic = data.item as Comic;

  return (
    <main className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="relative h-[400px] w-full md:w-1/3">
            <Image
              src={`https://img.otruyenapi.com/uploads/comics/${comic.thumb_url}`}
              alt={comic.name}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="mb-4 text-4xl font-bold text-white">{comic.name}</h1>
            <div className="mb-4 flex flex-wrap gap-2">
              {comic.category.map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-full bg-white/10 px-3 py-1 text-sm text-white"
                >
                  {cat.name}
                </span>
              ))}
            </div>
            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: comic.content }} />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-white">Danh Sách Chương</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {comic.chapters[0].server_data.map((chapter) => (
              <a
                key={chapter.chapter_name}
                href={`/comic/${comic.slug}/chapter/${chapter.chapter_name}`}
                className="rounded-lg bg-white/5 p-4 text-white transition-colors hover:bg-white/10"
              >
                <h3 className="font-semibold">
                  Chương {chapter.chapter_name}
                  {chapter.chapter_title && `: ${chapter.chapter_title}`}
                </h3>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 