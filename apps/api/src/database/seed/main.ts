import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import { hashPassword } from 'better-auth/crypto'
import { drizzle } from 'drizzle-orm/node-postgres'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres/driver'
import { reset, seed } from 'drizzle-seed'
import { Pool } from 'pg'
import { schema } from '../schemas'
import 'dotenv/config'

export class DatabaseSeed {
	private readonly logger = new Logger(DatabaseSeed.name)
	private readonly pool: Pool
	private readonly db: NodePgDatabase<typeof schema>

	constructor() {
		const host = process.env.DATABASE_HOST
		const user = process.env.DATABASE_USER
		const password = process.env.DATABASE_PASSWORD
		const database = process.env.DATABASE_NAME
		const rawPort = process.env.DATABASE_PORT

		if (!host || !user || !password || !database) {
			throw new Error(
				'Missing required database environment variables. Please ensure DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD and DATABASE_NAME are set.'
			)
		}

		const port = Number(rawPort ?? 5432)

		if (Number.isNaN(port)) {
			throw new Error(
				`Invalid DATABASE_PORT value: "${rawPort}". Please provide a valid numeric port.`
			)
		}

		this.pool = new Pool({
			host,
			port,
			user,
			password,
			database
		})

		this.db = drizzle({ client: this.pool, schema })
	}

	async main() {
		const env = process.env.NODE_ENV || 'development'

		const defaultAccountPassword = await hashPassword('12345678')

		try {
			if (env !== 'development') {
				this.logger.error(
					`Database seed is only allowed in development environment. Current environment: ${env}`
				)
				process.exitCode = 1
				await this.pool.end()
				return
			}

			this.logger.log('Resetting database...')
			await reset(this.db, schema)

			this.logger.log('Starting database seed 🕐')
			await seed(this.db, schema).refine((f) => ({
				users: {
					columns: {
						id: f.uuid(),
						image: f.default({ defaultValue: null })
					},
					count: 1000,
					with: { accounts: 1, sessions: 3, bookmarks: 100 }
				},
				accounts: {
					columns: {
						id: f.uuid(),
						accountId: f.uuid(),
						providerId: f.default({ defaultValue: 'credential' }),
						accessToken: f.default({ defaultValue: null }),
						refreshToken: f.default({ defaultValue: null }),
						idToken: f.default({ defaultValue: null }),
						accessTokenExpiresAt: f.default({ defaultValue: null }),
						refreshTokenExpiresAt: f.default({ defaultValue: null }),
						scope: f.default({ defaultValue: null }),
						password: f.default({ defaultValue: defaultAccountPassword })
					}
				},
				sessions: {
					columns: {
						id: f.uuid(),
						expiresAt: f.date({
							minDate: new Date(),
							maxDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
						}),
						token: f.uuid(),
						ipAddress: f.valuesFromArray({
							values: faker.helpers.uniqueArray(faker.internet.ip, 100)
						}),
						userAgent: f.valuesFromArray({
							values: faker.helpers.uniqueArray(faker.internet.userAgent, 100)
						})
					}
				},
				verifications: {
					columns: {
						id: f.uuid(),
						expiresAt: f.date({
							minDate: new Date(Date.now() + 1000 * 60 * 60), // 1h from now
							maxDate: new Date(Date.now() + 1000 * 60 * 60)
						})
					},
					count: 100
				},
				bookmarks: {
					columns: {
						title: f.valuesFromArray({
							values: faker.helpers.uniqueArray(faker.lorem.sentence, 100)
						}),
						description: f.valuesFromArray({
							values: faker.helpers.uniqueArray(faker.lorem.paragraph, 100)
						}),
						favicon: f.default({ defaultValue: null }),
						url: f.valuesFromArray({
							values: faker.helpers.uniqueArray(faker.internet.url, 100)
						}),
						visitCount: f.int({ minValue: 0, maxValue: 1000 }),
						isArchived: f.valuesFromArray({
							values: [
								{
									weight: 0.8,
									values: [false]
								},
								{
									weight: 0.2,
									values: [true]
								}
							]
						})
					}
				},
				tags: { count: 10000 },
				bookmarkTags: { count: 1000 }
			}))
			this.logger.log('Database seed completed successfully ✅')
		} catch (error) {
			this.logger.error('Database seed failed ❌:', error)
			process.exitCode = 1
			return
		} finally {
			await this.pool.end()
			this.logger.log('Database pool closed 🛑')
		}
	}
}

try {
	const databaseSeed = new DatabaseSeed()
	void databaseSeed.main()
} catch (error) {
	const logger = new Logger(DatabaseSeed.name)
	logger.error('Database seed initialization failed ❌:', error)
	process.exitCode = 1
}
