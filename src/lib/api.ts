import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

const BASE_URL = 'https://otruyenapi.com/v1/api';

// Cache cho dữ liệu
let comicsCache: any = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// Hàm đọc dữ liệu từ cache
async function readComicsData() {
  const now = Date.now();
  
  // Nếu có cache và cache chưa hết hạn
  if (comicsCache && (now - lastCacheTime) < CACHE_DURATION) {
    return comicsCache;
  }

  try {
    // Lấy dữ liệu từ API thay vì file
    const response = await axios.get(`${BASE_URL}/comics`);
    comicsCache = response.data;
    lastCacheTime = now;
    return comicsCache;
  } catch (error) {
    console.error('Error reading comics data:', error);
    return [];
  }
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút
      cacheTime: 10 * 60 * 1000, // 10 phút
    },
  },
});

export async function getHome() {
  try {
    // Lấy dữ liệu từ API /home
    const response = await api.get('/home');
    const comics = response.data.data.items;

    // Xử lý dữ liệu để lấy thông tin chương mới nhất
    const processedComics = comics.map((comic: any) => {
      const latestChapter = comic.chaptersLatest?.[0];
      return {
        ...comic,
        chapters: latestChapter ? [{
          chapter_name: latestChapter.chapter_name,
          chapter_title: latestChapter.chapter_title,
          chapter_api_data: latestChapter.chapter_api_data
        }] : [],
        total_chapters: latestChapter ? parseInt(latestChapter.chapter_name) : 0
      };
    });

    return { data: { items: processedComics } };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return { data: { items: [] } };
  }
}

export async function getComicsByCategory(category: string) {
  try {
    const comics = await readComicsData();
    const filteredComics = comics.filter((comic: any) => 
      comic.category?.some((cat: any) => cat.slug === category)
    );
    return { data: { items: filteredComics } };
  } catch (error) {
    console.error('Error reading comics data:', error);
    return { data: { items: [] } };
  }
}

export async function getComic(slug: string) {
  try {
    const comics = await readComicsData();
    const comic = comics.find((c: any) => c.slug === slug);
    return { data: comic || null };
  } catch (error) {
    console.error('Error reading comics data:', error);
    return { data: null };
  }
}

export const getComicDetail = async (slug: string) => {
  try {
    console.log('Fetching comic detail for slug:', slug);
    const response = await api.get(`/truyen-tranh/${slug}`);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching comic detail:', error);
    throw error;
  }
};

export const getChapterImages = async (chapterId: string) => {
  const response = await axios.get(chapterId);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/the-loai');
  return response.data;
};

export const getComics = async () => {
  const { data: categoriesData } = await getCategories();
  const firstCategory = categoriesData.items[0];
  const response = await api.get(`/the-loai/${firstCategory.slug}`);
  return response.data;
};

export const searchComics = async (keyword: string) => {
  const response = await api.get('/tim-kiem', {
    params: { keyword }
  });
  return response.data;
};

/**
 * Lấy danh sách truyện tương tự
 */
export const getSimilarComics = async (comicId: string) => {
  try {
    const response = await fetch(
      `https://otruyenapi.com/v1/api/comics/${comicId}/similar`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch similar comics');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching similar comics:', error);
    return { success: false, data: { items: [] } };
  }
};

export async function getAllPages(url: string, page = 1, allItems: any[] = []): Promise<any[]> {
  try {
    const response = await fetch(`${url}?page=${page}`, {
      headers: {
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data = await response.json();
    const items = [...allItems, ...data.data.items];
    
    if (data.data.pagination && data.data.pagination.currentPage < data.data.pagination.totalPages) {
      return getAllPages(url, page + 1, items);
    }
    
    return items;
  } catch (error) {
    console.error('Error fetching all pages:', error);
    return allItems;
  }
} 