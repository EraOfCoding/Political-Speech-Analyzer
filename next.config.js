/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
    serverComponentsExternalPackages: ['@distube/ytdl-core', 'undici'],
  },
}

module.exports = nextConfig
