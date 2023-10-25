/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
		serverComponentsExternalPackages: ["llamaindex"],
	},
}

module.exports = nextConfig
