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
  // Cấu hình cho Cloudflare Pages
  trailingSlash: true,
  // Tối ưu hóa cho Cloudflare Pages
  swcMinify: true,
  // Cấu hình runtime cho API routes
  experimental: {
    serverComponentsExternalPackages: ['react', 'react-dom']
  },
  // Giảm kích thước bundle
  webpack: (config, { dev, isServer }) => {
    // Chỉ áp dụng cho production build
    if (!dev && isServer) {
      // Loại bỏ một số thư viện lớn khỏi server bundle
      config.externals = [...config.externals, 'react', 'react-dom'];
    }
    return config;
  }
};

module.exports = nextConfig;