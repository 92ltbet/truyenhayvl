export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Nếu là request đến API, chuyển tiếp đến API route
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRequest(request, env, ctx);
    }
    
    // Nếu không, chuyển tiếp đến Next.js app
    return await handleNextRequest(request, env, ctx);
  }
};

async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  
  // Chuyển tiếp yêu cầu đến API gốc
  const apiUrl = `https://otruyenapi.com/v1/api/${path}${url.search}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined
    });
    
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleNextRequest(request, env, ctx) {
  // Chuyển tiếp yêu cầu đến Next.js app
  const url = new URL(request.url);
  
  // Nếu là request đến file tĩnh, chuyển tiếp đến thư mục static
  if (url.pathname.startsWith('/_next/static/')) {
    const staticUrl = url.pathname.replace('/_next/static/', '/.next/static/');
    return fetch(`${url.origin}${staticUrl}${url.search}`);
  }
  
  // Nếu không, chuyển tiếp đến Next.js app
  return fetch(request);
}
