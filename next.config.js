/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
  // Tối ưu hóa cho Cloudflare Pages
  output: 'standalone',
  // Giảm kích thước bundle
  webpack: (config, { dev, isServer }) => {
    // Chỉ áp dụng cho production build
    if (!dev && isServer) {
      // Loại bỏ một số thư viện lớn khỏi server bundle
      config.externals = [...config.externals, 'react', 'react-dom'];
    }
    return config;
  },
  // Tắt source maps trong production để giảm kích thước
  productionBrowserSourceMaps: false
};

module.exports = nextConfig;