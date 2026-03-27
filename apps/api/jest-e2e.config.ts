import { jestApiConfig } from '@repo/testing-config/jest'
import type { Config } from 'jest'

const config: Config = {
	...jestApiConfig,
	rootDir: './__tests__',
	testRegex: '.*\\.e2e\\.spec\\.ts$',
	setupFilesAfterEnv: ['<rootDir>/setup-e2e.ts']
}

export default config
