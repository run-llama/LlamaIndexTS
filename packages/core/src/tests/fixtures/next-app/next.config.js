/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["llamaindex"], // Put in actual NodeJS mode with NextJS App Router
  },
};

module.exports = nextConfig;
