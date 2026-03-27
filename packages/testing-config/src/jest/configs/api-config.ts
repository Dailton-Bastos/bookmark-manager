import type { Config } from 'jest'
import { jestBaseConfig } from './base-config'

export const jestApiConfig: Config = {
	...jestBaseConfig,
	moduleFileExtensions: ['ts', 'js', 'json'],
	testEnvironment: 'node'
}
