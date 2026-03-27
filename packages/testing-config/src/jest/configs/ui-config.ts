import type { Config } from 'jest'
import { jestBaseConfig } from './base-config'

export const jestUiConfig: Config = {
	...jestBaseConfig,
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
	testEnvironment: 'jsdom'
}
