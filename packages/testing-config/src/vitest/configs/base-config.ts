import path from 'node:path'

import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export const vitestBaseConfig = defineConfig({
	plugins: [
		swc.vite({
			jsc: {
				transform: {
					react: {
						runtime: 'automatic'
					}
				}
			}
		})
	],
	resolve: {
		alias: {
			'@': path.resolve(process.cwd(), 'src')
		}
	},
	test: {
		globals: true,
		clearMocks: true,
		mockReset: true,
		restoreMocks: true,
		include: ['**/*.spec.{ts,tsx,js,jsx}'],
		exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
		coverage: {
			provider: 'v8',
			reportsDirectory: 'coverage'
		}
	}
})
