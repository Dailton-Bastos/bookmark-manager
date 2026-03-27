import { jestApiConfig } from '@repo/testing-config/jest'
import type { Config } from 'jest'

const config: Config = {
	...jestApiConfig,
	rootDir: 'src',
	collectCoverage: true,
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
