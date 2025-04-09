export async function onRequest(context) {
  const { request, env } = context;
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
