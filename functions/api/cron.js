export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    // Gọi API để cập nhật dữ liệu
    const response = await fetch('https://otruyenapi.com/v1/api/home');
    const data = await response.json();
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Cron job completed successfully',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error),
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
