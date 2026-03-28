/** @type {import('postcss-load-config').Config} */

import path from 'node:path';

const baseDir = path.resolve(new URL('.', import.meta.url).pathname, '..', '..');

export default {
	plugins: {
		'@tailwindcss/postcss': {
			base: baseDir
		}
	}
}
