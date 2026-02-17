/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
    serverComponentsExternalPackages: ['@distube/ytdl-core', 'undici', 'play-dl'],
  },
  webpack: (config, { isServer }) => {
    // Exclude server-only packages from client bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@distube/ytdl-core': false,
        'undici': false,
        'play-dl': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
