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
  // Cấu hình runtime cho API routes
  experimental: {
    serverComponentsExternalPackages: ['react', 'react-dom']
  },
  // Tối ưu hóa kích thước bundle
  webpack: (config, { dev, isServer }) => {
    // Chỉ áp dụng cho production build
    if (!dev) {
      // Tối ưu hóa kích thước các chunk
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }

    return config;
  },
  // Thư mục output
  distDir: '.next-cf'
};

module.exports = nextConfig;