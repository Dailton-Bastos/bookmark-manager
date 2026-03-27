import type { Config } from 'jest'

export const jestBaseConfig: Config = {
	rootDir: './',
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true,
	coverageProvider: 'v8',
	testRegex: '.*\\.spec\\.(t|j)sx?$',
	testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
	collectCoverageFrom: ['**/*.{t,j}s?(x)'],
	coverageDirectory: 'coverage',
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	transform: {
		'^.+\\.(t|j)sx?$': '@swc/jest'
	},
	maxWorkers: '50%'
}
