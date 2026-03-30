import { jestBaseConfig } from '@repo/testing-config/jest'
import type { Config } from 'jest'

const config: Config = {
	...jestBaseConfig,
	rootDir: 'src',
	testEnvironment: 'node',
	coverageDirectory: '../coverage',
	collectCoverageFrom: [
		'**/*.{ts,js}',
		'!**/index.{ts,js}',
		'!**/types.{ts,js}'
	]
}

export default config
