// Trong fetch handler
if (url.pathname === '/') {
  // Thử phục vụ một trong các file SPA sau
  const possibleIndexFiles = [
    '/index.html', 
    '/_app/_main/index.html',
    '/app/index.html'
  ];
  
  for (const indexFile of possibleIndexFiles) {
    try {
      const staticContent = env.ASSETS || env.__STATIC_CONTENT || env.STATIC_CONTENT;
      const response = await staticContent.fetch(new Request(new URL(indexFile, request.url)));
      
      if (response.status === 200) {
        return response;
      }
    } catch (e) {
      console.error(`Lỗi khi tìm file: ${indexFile}`, e);
    }
  }
  
  // Nếu không tìm thấy, phục vụ trang đơn giản
  return new Response(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VenComic</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; background: #1a1a2e; color: #fff; }
        h1 { color: #f25f4c; }
        a { color: #ff8906; text-decoration: none; margin: 0 10px; }
        a:hover { text-decoration: underline; }
        nav { margin: 2rem 0; }
      </style>
    </head>
    <body>
      <h1>VenComic</h1>
      <p>Trang đọc truyện tranh online</p>
      <nav>
        <a href="/the-loai">Thể loại</a>
        <a href="/theo-doi">Theo dõi</a>
        <a href="/truyen">Danh sách truyện</a>
      </nav>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
  });
}