/** biome-ignore-all lint/style/noCommonJs: Using CommonJS modules for Node.js environment */
const { Logger } = require('@nestjs/common')
const { drizzle } = require('drizzle-orm/node-postgres')
const { migrate } = require('drizzle-orm/node-postgres/migrator')
const { Pool } = require('pg')
require('dotenv/config')

class RunMigrations {
	constructor() {
		this.pool = null
		this.db = null
		this.logger = new Logger(RunMigrations.name)
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

		this.db = drizzle({ client: this.pool })
	}

	async main() {
		const env = process.env.NODE_ENV || 'production'

		try {
			if (env !== 'production') {
				this.logger.error(
					`Migrations are only allowed in production environment. Current environment: ${env}`
				)
				process.exitCode = 1
				return
			}

			this.logger.log('Running production database migrations... 🕐')

			// This points to the folder cloned/copied to the root of container workspace
			await migrate(this.db, { migrationsFolder: './drizzle' })

			this.logger.log('Migrations applied successfully! ✅')
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error))
			this.logger.error('Migration failed to apply: ❌', err.stack)
			process.exitCode = 1
			return
		} finally {
			await this.pool.end()
			this.logger.log('Database pool closed 🛑')
		}
	}
}

try {
	const runMigrations = new RunMigrations()
	void runMigrations.main().catch((error) => {
		const logger = new Logger(RunMigrations.name)
		const err = error instanceof Error ? error : new Error(String(error))
		logger.error('Migration failed to apply: ❌', err.stack)
		process.exitCode = 1
	})
} catch (error) {
	const logger = new Logger(RunMigrations.name)
	logger.error('Migration initialization failed ❌:', error)
	process.exitCode = 1
}
