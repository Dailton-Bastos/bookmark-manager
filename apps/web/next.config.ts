import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'standalone',
	transpilePackages: ['ui', '@repo/schemas'],
	images: {
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
	}
}

export default nextConfig
