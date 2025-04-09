// Cấu hình Cloudflare Workers cho Next.js
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  try {
    // Lấy tài nguyên tĩnh từ KV storage
    return await getAssetFromKV(event);
  } catch (e) {
    // Nếu không tìm thấy tài nguyên, trả về trang 404
    return new Response('Not Found', { status: 404 });
  }
}
