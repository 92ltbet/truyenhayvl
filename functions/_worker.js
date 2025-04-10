export default {
  async fetch(request, env, ctx) {
    console.log('URL:', request.url);
    console.log('Available bindings:', Object.keys(env));
    
    const url = new URL(request.url);
    const path = url.pathname;

    // Xử lý các request API
    if (path.startsWith('/api/')) {
      // Logic xử lý API
      return new Response(JSON.stringify({ message: 'API route' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      // Kiểm tra binding ASSETS có tồn tại không
      if (!env.ASSETS) {
        console.error('ASSETS binding không tìm thấy');
        
        // Nếu là route SPA, trả về trang dự phòng
        if (path === '/' || 
            path.startsWith('/the-loai') ||
            path.startsWith('/theo-doi') ||
            path.startsWith('/truyen/')) {
          return new Response(
            `<!DOCTYPE html>
            <html>
              <head>
                <title>VenComic</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                  h1 { color: #333; }
                  a { color: #0070f3; text-decoration: none; }
                  a:hover { text-decoration: underline; }
                </style>
              </head>
              <body>
                <h1>VenComic</h1>
                <p>Chưa thể tải trang. Vui lòng thử lại sau.</p>
                <div>
                  <a href="/">Trang chủ</a> | 
                  <a href="/the-loai">Thể loại</a> | 
                  <a href="/theo-doi">Theo dõi</a>
                </div>
              </body>
            </html>`,
            {
              headers: {
                'Content-Type': 'text/html;charset=UTF-8',
              },
            }
          );
        }
        
        return new Response('ASSETS binding không tìm thấy', { status: 500 });
      }

      // Xử lý các tệp tĩnh
      let staticAsset;
      try {
        staticAsset = await env.ASSETS.fetch(request);
        if (staticAsset.status === 200) {
          return staticAsset;
        }
      } catch (assetError) {
        console.error('Lỗi khi tải tệp tĩnh:', assetError);
      }

      // Các đường dẫn SPA - trả về index.html
      if (path === '/' || 
          path.startsWith('/the-loai') ||
          path.startsWith('/theo-doi') ||
          path.startsWith('/truyen/')) {
        try {
          const indexResponse = await env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
          if (indexResponse.status === 200) {
            return indexResponse;
          }
        } catch (indexError) {
          console.error('Lỗi khi tải index.html:', indexError);
        }
      }
      
      // Nếu không tìm thấy tài nguyên, trả về 404
      return new Response('Không tìm thấy trang', { status: 404 });
    } catch (error) {
      console.error('Lỗi:', error);
      return new Response('Lỗi máy chủ nội bộ', { status: 500 });
    }
  }
};

// Tạo trang chủ
async function createHomePage() {
  try {
    // Tải dữ liệu từ API
    const response = await fetch('https://otruyenapi.com/v1/api/home');
    const data = await response.json();
    const comics = data.data?.items || [];
    
    return new Response(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VenComic - Trang chủ</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #0f172a; color: #f8fafc; }
          .container { max-width: 1200px; margin: 0 auto; padding: 1rem; }
          header { padding: 1rem 0; border-bottom: 1px solid #1e293b; margin-bottom: 2rem; }
          nav { display: flex; gap: 1rem; margin-top: 1rem; }
          nav a { color: #38bdf8; text-decoration: none; padding: 0.5rem 1rem; border-radius: 0.25rem; }
          nav a:hover { background: #1e293b; }
          h1, h2 { color: #f472b6; }
          .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
          .comic { border-radius: 0.5rem; overflow: hidden; background: #1e293b; transition: transform 0.2s; }
          .comic:hover { transform: translateY(-5px); }
          .comic img { width: 100%; aspect-ratio: 2/3; object-fit: cover; }
          .comic-info { padding: 0.75rem; }
          .comic-title { font-size: 1rem; margin: 0; margin-bottom: 0.5rem; height: 2.8rem; overflow: hidden; }
          .comic a { color: inherit; text-decoration: none; }
          .chapter { font-size: 0.875rem; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>VenComic</h1>
            <nav>
              <a href="/">Trang chủ</a>
              <a href="/the-loai">Thể loại</a>
              <a href="/theo-doi">Theo dõi</a>
            </nav>
          </header>
          
          <main>
            <h2>Truyện mới cập nhật</h2>
            <div class="grid">
              ${comics.slice(0, 18).map(comic => `
                <div class="comic">
                  <a href="/truyen/${comic.slug}">
                    <img src="https://img.otruyenapi.com/uploads/comics/${comic.thumb_url}" alt="${comic.name}" loading="lazy">
                    <div class="comic-info">
                      <h3 class="comic-title">${comic.name}</h3>
                      <div class="chapter">Chapter ${comic.chaptersLatest?.[0]?.chapter_name || '?'}</div>
                    </div>
                  </a>
                </div>
              `).join('')}
            </div>
          </main>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
    });
  } catch (error) {
    return createErrorPage(`Lỗi khi tải dữ liệu: ${error.message}`);
  }
}

// Tạo trang thể loại
function createCategoryPage(path) {
  return new Response(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VenComic - Thể loại</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #0f172a; color: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 1rem; }
        header { padding: 1rem 0; border-bottom: 1px solid #1e293b; margin-bottom: 2rem; }
        nav { display: flex; gap: 1rem; margin-top: 1rem; }
        nav a { color: #38bdf8; text-decoration: none; padding: 0.5rem 1rem; border-radius: 0.25rem; }
        nav a:hover { background: #1e293b; }
        h1, h2 { color: #f472b6; }
        .categories { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
        .category { background: #1e293b; padding: 1rem; border-radius: 0.5rem; }
        .category a { color: inherit; text-decoration: none; }
        .category:hover { background: #2d3748; }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>VenComic</h1>
          <nav>
            <a href="/">Trang chủ</a>
            <a href="/the-loai">Thể loại</a>
            <a href="/theo-doi">Theo dõi</a>
          </nav>
        </header>
        
        <main>
          <h2>Thể loại truyện</h2>
          <div class="categories">
            <div class="category"><a href="/the-loai/action">Action</a></div>
            <div class="category"><a href="/the-loai/adventure">Adventure</a></div>
            <div class="category"><a href="/the-loai/comedy">Comedy</a></div>
            <div class="category"><a href="/the-loai/drama">Drama</a></div>
            <div class="category"><a href="/the-loai/fantasy">Fantasy</a></div>
            <div class="category"><a href="/the-loai/horror">Horror</a></div>
            <div class="category"><a href="/the-loai/mystery">Mystery</a></div>
            <div class="category"><a href="/the-loai/romance">Romance</a></div>
            <div class="category"><a href="/the-loai/school-life">School Life</a></div>
            <div class="category"><a href="/the-loai/slice-of-life">Slice of Life</a></div>
            <div class="category"><a href="/the-loai/supernatural">Supernatural</a></div>
            <div class="category"><a href="/the-loai/manhwa">Manhwa</a></div>
            <div class="category"><a href="/the-loai/manhua">Manhua</a></div>
            <div class="category"><a href="/the-loai/manga">Manga</a></div>
            <div class="category"><a href="/the-loai/webtoon">Webtoon</a></div>
          </div>
        </main>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
  });
}

// Tạo trang theo dõi
function createFollowPage() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VenComic - Theo dõi</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #0f172a; color: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 1rem; }
        header { padding: 1rem 0; border-bottom: 1px solid #1e293b; margin-bottom: 2rem; }
        nav { display: flex; gap: 1rem; margin-top: 1rem; }
        nav a { color: #38bdf8; text-decoration: none; padding: 0.5rem 1rem; border-radius: 0.25rem; }
        nav a:hover { background: #1e293b; }
        h1, h2 { color: #f472b6; }
        .message { background: #1e293b; padding: 2rem; border-radius: 0.5rem; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>VenComic</h1>
          <nav>
            <a href="/">Trang chủ</a>
            <a href="/the-loai">Thể loại</a>
            <a href="/theo-doi">Theo dõi</a>
          </nav>
        </header>
        
        <main>
          <h2>Truyện theo dõi</h2>
          <div class="message">
            <p>Bạn chưa đăng nhập! Vui lòng đăng nhập để sử dụng tính năng theo dõi.</p>
          </div>
        </main>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
  });
}

// Tạo trang chi tiết truyện
function createComicPage(path) {
  const comicSlug = path.split('/')[2];
  
  return new Response(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VenComic - Chi tiết truyện</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #0f172a; color: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 1rem; }
        header { padding: 1rem 0; border-bottom: 1px solid #1e293b; margin-bottom: 2rem; }
        nav { display: flex; gap: 1rem; margin-top: 1rem; }
        nav a { color: #38bdf8; text-decoration: none; padding: 0.5rem 1rem; border-radius: 0.25rem; }
        nav a:hover { background: #1e293b; }
        h1, h2 { color: #f472b6; }
        .message { background: #1e293b; padding: 2rem; border-radius: 0.5rem; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>VenComic</h1>
          <nav>
            <a href="/">Trang chủ</a>
            <a href="/the-loai">Thể loại</a>
            <a href="/theo-doi">Theo dõi</a>
          </nav>
        </header>
        
        <main>
          <h2>Chi tiết truyện: ${comicSlug}</h2>
          <div class="message">
            <p>Đang tải thông tin truyện...</p>
            <p>Slug truyện: ${comicSlug}</p>
          </div>
        </main>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
  });
}

// Tạo trang lỗi
function createErrorPage(errorMessage, status = 500) {
  return new Response(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VenComic - Lỗi</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #0f172a; color: #f8fafc; }
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        h1 { color: #ef4444; }
        a { color: #38bdf8; }
        .error-box { background: #1e293b; padding: 1.5rem; border-radius: 0.5rem; border-left: 4px solid #ef4444; margin: 2rem 0; }
        .back-home { display: inline-block; margin-top: 1rem; background: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; text-decoration: none; }
        .back-home:hover { background: #1d4ed8; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Đã xảy ra lỗi ${status}</h1>
        <div class="error-box">
          <p>${errorMessage}</p>
        </div>
        <a href="/" class="back-home">Quay về trang chủ</a>
      </div>
    </body>
    </html>
  `, {
    status,
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
  });
}

async function handleApiRequest(request, env, ctx) {
  // Xử lý API requests
  return new Response(JSON.stringify({ message: 'API endpoint' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}