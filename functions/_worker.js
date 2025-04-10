export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    console.log(`Request URL: ${url.pathname}`);
    console.log(`Available bindings: ${Object.keys(env).join(', ')}`);
    
    // Xử lý routes API
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApiRequest(request, env, ctx);
      } catch (error) {
        console.error(`API error: ${error.message}`);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Kiểm tra nếu request là cho static asset
    try {
      // Kiểm tra ASSETS binding có tồn tại không
      if (!env.ASSETS) {
        console.error('ASSETS binding không tồn tại!');
        // Nếu không có ASSETS binding, trả về index.html trực tiếp
        return new Response(`
          <!DOCTYPE html>
          <html lang="vi">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>VenComic - Đọc truyện tranh online</title>
            <style>
              body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
              h1 { color: #3b82f6; }
              a { color: #2563eb; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h1>VenComic</h1>
            <p>Chào mừng đến với trang đọc truyện tranh online</p>
            <nav>
              <p>
                <a href="/">Trang chủ</a> | 
                <a href="/the-loai">Thể loại</a> | 
                <a href="/theo-doi">Theo dõi</a>
              </p>
            </nav>
            <p><b>Thông báo:</b> Trang web đang trong quá trình cập nhật. Vui lòng quay lại sau.</p>
            <p><i>Lỗi kỹ thuật: ASSETS binding không tồn tại.</i></p>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html;charset=utf-8' },
        });
      }
      
      // Lấy path cần thiết cho asset từ URL
      let assetPath = url.pathname;
      
      // Xử lý root path
      if (assetPath === '/') {
        assetPath = '/index.html';
      }
      
      // Thử phục vụ file tĩnh từ ASSETS
      const asset = await env.ASSETS.fetch(new Request(new URL(assetPath, request.url), request));
      
      if (asset.status === 200) {
        console.log(`Asset served: ${assetPath}`);
        return asset;
      }
      
      console.log(`Asset không tìm thấy: ${assetPath}, trả về index.html`);
      
      // Nếu file không tồn tại, trả về index.html cho SPA routes
      const indexHtml = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
      
      if (indexHtml.status === 200) {
        return new Response(await indexHtml.text(), {
          status: 200,
          headers: { 'Content-Type': 'text/html;charset=utf-8' }
        });
      }
      
      // Nếu không có index.html, trả về mã 404 
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error(`Error serving static asset: ${error.message}`);
      return fallbackResponse(error.message);
    }
  }
};

async function handleApiRequest(request, env, ctx) {
  // Xử lý API requests
  return new Response(JSON.stringify({ message: 'API endpoint' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function fallbackResponse(errorMessage) {
  return new Response(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VenComic - Lỗi</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        h1 { color: #ef4444; }
        pre { background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; overflow: auto; }
      </style>
    </head>
    <body>
      <h1>Đã xảy ra lỗi</h1>
      <p>Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
      <pre>${errorMessage}</pre>
      <p><a href="/">Quay lại trang chủ</a></p>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
    status: 500
  });
}
