/** @type {import('postcss-load-config').Config} */

export default {
	plugins: {
		'@tailwindcss/postcss': {
			base: '../../',
			content: ['../ui/src/**/*.{ts,tsx,mdx,css}']
		}
	}
}
