import type { NextConfig } from 'next'

const apiUrl = process.env.API_URL

if (!apiUrl) {
	throw new Error('Missing required environment variable: API_URL')
}

const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${apiUrl}/api/:path*`
			}
		]
	},
	output: 'standalone',
	transpilePackages: ['ui', '@repo/schemas'],
	images: {
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
	}
}

export default nextConfig
