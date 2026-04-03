import { jestApiConfig } from '@repo/testing-config/jest'
import type { Config } from 'jest'

const config: Config = {
	...jestApiConfig,
	rootDir: 'src',
	collectCoverage: false,
	moduleNameMapper: {
		...jestApiConfig.moduleNameMapper,
		'@thallesp/nestjs-better-auth':
			'<rootDir>/auth/__mocks__/nestjs-better-auth.ts' // Mock for @thallesp/nestjs-better-auth
	},
	coverageDirectory: '../coverage',
	collectCoverageFrom: [
		'**/*.(t|j)s',
		'!**/*.mock.ts',
		'!**/*.d.ts',
		'!**/*.module.ts',
		'!main.ts'
	]
}

export default config
