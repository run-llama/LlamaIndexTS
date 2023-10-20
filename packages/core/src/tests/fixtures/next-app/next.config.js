/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Puts pdf-parse in actual NodeJS mode with NextJS App Router
  },
};

module.exports = nextConfig;
