import { defineConfig, mergeConfig } from 'vitest/config'

import { vitestBaseConfig } from './base-config'

export const vitestApiConfig = mergeConfig(
	vitestBaseConfig,
	defineConfig({
		test: {
			environment: 'node'
		}
	})
)
