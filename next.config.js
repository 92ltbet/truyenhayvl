/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.otruyenapi.com',
        port: '',
        pathname: '/uploads/comics/**',
      },
      {
        protocol: 'https',
        hostname: 'sv1.otruyencdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.vencomic.com',
        port: '',
        pathname: '/**',
      }
    ]
  },
  // Tạo bản build tĩnh cho Cloudflare Pages
  output: 'export',
  // Tắt source maps trong production để giảm kích thước
  productionBrowserSourceMaps: false,
  // Cấu hình cho static export
  trailingSlash: true,
  // Bỏ qua các lỗi liên quan đến API routes trong static export
  distDir: 'out'
};

module.exports = nextConfig;