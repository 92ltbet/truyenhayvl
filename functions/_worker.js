export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Nếu là request đến API, chuyển tiếp đến API route
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRequest(request, env, ctx);
    }

    // Nếu là request đến trang chủ hoặc bất kỳ trang nào khác, trả về trang index.html
    try {
      // Thử lấy file từ thư mục public
      const response = await env.ASSETS.fetch(new Request(new URL('/index.html', url.origin)));
      return response;
    } catch (e) {
      // Nếu không tìm thấy file, trả về trang lỗi 404
      return new Response('Page not found', { status: 404 });
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
      redirect: 'follow'
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
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
