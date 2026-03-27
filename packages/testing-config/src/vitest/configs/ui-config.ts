import react from '@vitejs/plugin-react-swc'
import { defineConfig, mergeConfig } from 'vitest/config'

import { vitestBaseConfig } from './base-config'

export const vitestUiConfig = mergeConfig(
	vitestBaseConfig,
	defineConfig({
		plugins: [react()],
		test: {
			environment: 'jsdom'
		}
	})
)
