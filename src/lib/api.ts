import { QueryClient } from '@tanstack/react-query';

const BASE_URL = 'https://otruyenapi.com/v1/api';

// Không sử dụng cache in-memory nữa, Cloudflare Edge Cache hoặc KV sẽ tốt hơn.
// let comicsCache: any = null;
// let lastCacheTime = 0;
// const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// Hàm gọi API chung sử dụng fetch
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
      // Cloudflare Pages/Workers tự động cache hoặc bạn có thể cấu hình Cache API
      // cache: 'no-store', // hoặc 'force-cache', 'default', etc.
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Error [${response.status} ${response.statusText}] at ${url}: ${errorData}`);
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    // Kiểm tra content-type trước khi parse JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
    }
    // Trả về text nếu không phải JSON để tránh lỗi parse
    return await response.text(); 
  } catch (error) {
    console.error(`Fetch Error for ${url}:`, error);
    throw error; // Ném lỗi ra ngoài để hàm gọi xử lý
  }
}

// Bỏ axios instance
// export const api = axios.create({...

// QueryClient vẫn giữ nguyên
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút
      cacheTime: 10 * 60 * 1000, // 10 phút
    },
  },
});

// Hàm đọc dữ liệu cũ (readComicsData) không còn cần thiết vì cache in-memory không hiệu quả.

export async function getHome() {
  try {
    const responseData = await fetchAPI('/home');
    // Kiểm tra cấu trúc data trả về từ API /home
    const comics = responseData?.data?.items || []; 

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
    // Lỗi đã được log trong fetchAPI, chỉ cần trả về giá trị mặc định
    return { data: { items: [] } };
  }
}

// getComicsByCategory và getComic cần gọi API thay vì đọc cache
export async function getComicsByCategory(categorySlug: string) {
  try {
    // Giả sử API hỗ trợ filter theo category slug, ví dụ: /the-loai/{slug}
    const responseData = await fetchAPI(`/the-loai/${categorySlug}`); 
    return { data: { items: responseData?.data?.items || [] } };
  } catch (error) {
    return { data: { items: [] } };
  }
}

export async function getComic(slug: string) {
  try {
    // Gọi API chi tiết truyện tranh
    const responseData = await fetchAPI(`/truyen-tranh/${slug}`); 
    return { data: responseData?.data?.item || null }; // Điều chỉnh key dựa trên API response
  } catch (error) {
    return { data: null };
  }
}

export const getComicDetail = async (slug: string) => {
  try {
    console.log('Fetching comic detail for slug:', slug);
    const responseData = await fetchAPI(`/truyen-tranh/${slug}`);
    console.log('API Response Data:', responseData);
    return responseData; // responseData đã là JSON object
  } catch (error) {
    // Lỗi đã được log trong fetchAPI
    throw error;
  }
};

export const getChapterImages = async (chapterApiData: string) => {
  // chapterApiData là một URL đầy đủ, nên dùng fetch trực tiếp
  try {
    const response = await fetch(chapterApiData, { 
        headers: { 'Accept': 'application/json' } 
    });
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error [${response.status} ${response.statusText}] for chapter images ${chapterApiData}: ${errorData}`);
        throw new Error(`Failed to fetch chapter images from ${chapterApiData}: ${response.statusText}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
    }
    return await response.text();
  } catch (error) {
    console.error(`Fetch Error for chapter images ${chapterApiData}:`, error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const responseData = await fetchAPI('/the-loai');
    return responseData; // Trả về toàn bộ response data
  } catch (error) {
    // Có thể trả về một giá trị mặc định hoặc để lỗi nổi lên
    return { items: [] }; // Ví dụ trả về mảng rỗng
  }
};

// Đơn giản hóa getComics, gọi thẳng API danh sách truyện mới cập nhật
// API endpoint này cần được xác nhận lại với otruyenapi.com
export const getComics = async (page: number = 1) => {
  try {
    // Giả sử API có endpoint `/danh-sach/truyen-moi` hoặc tương tự
    const responseData = await fetchAPI(`/danh-sach/truyen-moi?page=${page}`); 
    return responseData; // Trả về response data trực tiếp
  } catch (error) {
    return { data: { items: [] } }; // Trả về cấu trúc mặc định khi lỗi
  }
};

export const searchComics = async (keyword: string) => {
  try {
    // Encode keyword để đảm bảo URL hợp lệ
    const encodedKeyword = encodeURIComponent(keyword);
    const responseData = await fetchAPI(`/tim-kiem?keyword=${encodedKeyword}`);
    return responseData;
  } catch (error) {
    // Xem xét trả về cấu trúc dữ liệu rỗng phù hợp
    return { data: { items: [] } }; 
  }
};

/**
 * Lấy danh sách truyện tương tự
 */
 // getSimilarComics đã sử dụng fetch, không cần thay đổi
export const getSimilarComics = async (comicId: string) => {
  try {
    const response = await fetch(
      `https://otruyenapi.com/v1/api/comics/${comicId}/similar`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store', // Xem xét lại caching strategy
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Error [${response.status} ${response.statusText}] fetching similar comics for ${comicId}: ${errorData}`);
      throw new Error(`Failed to fetch similar comics for ${comicId}`);
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
    }
    return await response.text();
  } catch (error) {
    console.error(`Fetch Error fetching similar comics for ${comicId}:`, error);
    // Trả về cấu trúc mặc định khi lỗi
    return { success: false, data: { items: [] } }; 
  }
};

// getAllPages đã sử dụng fetch, không cần thay đổi
export async function getAllPages(url: string, page = 1, allItems: any[] = []): Promise<any[]> {
  try {
    const response = await fetch(`${url}?page=${page}`, {
      headers: {
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Error [${response.status} ${response.statusText}] at ${url}?page=${page}: ${errorData}`);
      throw new Error(`Failed to fetch data from ${url}?page=${page}`);
    }
    
    const data = await response.json();
    const currentItems = data?.data?.items || [];
    const items = [...allItems, ...currentItems];
    
    // Kiểm tra kỹ cấu trúc pagination trả về từ API
    const pagination = data?.data?.pagination;
    if (pagination && pagination.currentPage < pagination.totalPages) {
      return getAllPages(url, page + 1, items);
    }
    
    return items;
  } catch (error) {
    console.error(`Fetch Error in getAllPages for ${url} page ${page}:`, error);
    return allItems; // Trả về những gì đã lấy được
  }
} 