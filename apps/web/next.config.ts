import type { NextConfig } from 'next'

const apiUrl = process.env.NEXT_PUBLIC_API_URL
const backendProtocol = process.env.API_PROTOCOL as 'http' | 'https'
const backendHost = process.env.API_HOST
const backendPort = process.env.API_PORT

if (!apiUrl) {
	throw new Error('Missing required environment variable: NEXT_PUBLIC_API_URL')
}

if (!backendProtocol) {
	throw new Error('Missing required environment variable: API_PROTOCOL')
}

if (!backendHost) {
	throw new Error('Missing required environment variable: API_HOST')
}

if (!backendPort) {
	throw new Error('Missing required environment variable: API_PORT')
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
		dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		remotePatterns: [
			{
				protocol: backendProtocol,
				hostname: backendHost,
				port: backendPort
			},
			{
				protocol: 'https',
				hostname: 'www.google.com',
				port: ''
			},
			{
				protocol: 'https',
				hostname: 'www.google.com.br',
				port: ''
			}
		]
	}
}

export default nextConfig
