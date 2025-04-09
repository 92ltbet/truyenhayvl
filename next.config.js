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
      // Loại bỏ các thư viện không cần thiết khỏi bundle
      config.externals = [...(config.externals || []), 'react', 'react-dom'];

      // Tối ưu hóa kích thước các chunk
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 0,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // Lấy tên package từ node_modules
                const packageName = module.context.match(/[\\/]node_modules[\\/]([^\\/]+)/)[1];
                // Tạo tên file nhỏ hơn
                return `npm.${packageName.replace('@', '')}`;
              },
            },
          },
        },
      };
    }

    return config;
  },
  // Tối ưu hóa output
  output: 'export',
  // Tắt tính năng tạo trang tĩnh cho các trang động
  staticPageGenerationTimeout: 120,
  distDir: '.next-cf'
};

module.exports = nextConfig;