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
  // Tắt source maps trong production để giảm kích thước
  productionBrowserSourceMaps: false,
  // Tối ưu hóa cho Cloudflare Pages
  swcMinify: true,
  // Tắt tính năng tạo trang tĩnh
  output: 'standalone',
  // Cấu hình runtime cho API routes
  experimental: {
    serverComponentsExternalPackages: ['react', 'react-dom']
  }
};

module.exports = nextConfig;