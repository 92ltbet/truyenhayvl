export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Xử lý API requests
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRequest(request, env, ctx);
    }

    // Xử lý static assets
    try {
      // Thử lấy file từ assets
      let path = url.pathname;
      
      // Nếu là request đến route, cần trả về index.html cho client-side routing
      if (!path.includes('.') && !path.startsWith('/api/')) {
        path = '/index.html';
      }
      
      // Xóa dấu / đầu tiên vì ASSETS cần path không có / ở đầu
      if (path.startsWith('/')) {
        path = path.substring(1);
      }
      
      // Nếu path trống, trả về index.html
      if (path === '') {
        path = 'index.html';
      }
      
      console.log(`Trying to fetch: ${path}`);
      const response = await env.ASSETS.fetch(new Request(new URL(path, url.origin)));
      return response;
    } catch (e) {
      console.error(`Error serving file: ${e.message}`);
      
      // Nếu là route (không phải static asset), trả về index.html cho client-side routing
      if (!url.pathname.includes('.')) {
        try {
          const indexResponse = await env.ASSETS.fetch(new Request(new URL('index.html', url.origin)));
          return indexResponse;
        } catch (indexErr) {
          console.error(`Error serving index.html: ${indexErr.message}`);
        }
      }
      
      // Cuối cùng, nếu không tìm thấy file, trả về trang lỗi 404
      return new Response('Page not found', { 
        status: 404,
        headers: {
          'Content-Type': 'text/html'
        }
      });
    }
  }
};

async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');

  // Chuyển tiếp yêu cầu đến API gốc
  const apiUrl = `https://otruyenapi.com/v1/api/${path}${url.search}`;

  try {
    console.log(`Forwarding API request to: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cloudflare Worker',
        'Accept': 'application/json'
      },
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
      redirect: 'follow'
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    console.error(`Error fetching API: ${error.message}`);
    return new Response(JSON.stringify({ error: 'Failed to fetch data', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
