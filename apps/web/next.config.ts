import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'standalone',
	webpack: (config, { dev }) => {
		if (dev) {
			const existingWatchOptions = config.watchOptions ?? {}

			config.watchOptions = {
				...existingWatchOptions,
				poll: 1000,
				aggregateTimeout: 300
			}
		}
		return config
	},
	images: {
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
	}
}

export default nextConfig
