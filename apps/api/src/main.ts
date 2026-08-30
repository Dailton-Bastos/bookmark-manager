import * as path from 'node:path'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { OpenAPIGenerator } from '@orpc/openapi'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { contract } from '@repo/contract'
import swaggerUi from 'swagger-ui-express'
import { AppModule } from './app.module'
import { appConfig } from './config/app.config'
import { EnvService } from './env/env.service'

async function bootstrap() {
	const logger = new Logger('Bootstrap')

	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		bodyParser: false,
		logger: ['log', 'error']
	})
	app.enableShutdownHooks()

	app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
		prefix: '/assets/'
	})

	appConfig(app)

	const configService = app.get(EnvService)

	const generator = new OpenAPIGenerator({
		schemaConverters: [new ZodToJsonSchemaConverter()]
	})

	const spec = await generator.generate(contract, {
		info: {
			title: 'Bookmark Manager API',
			version: '1.0.0'
		},
		servers: [{ url: `${configService.get('API_URL')}/api` }]
	})

	app
		.getHttpAdapter()
		.getInstance()
		.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec))

	const PORT = configService.get('PORT')
	const HOST = configService.get('HOST')
	const ENV = configService.get('NODE_ENV')

	await app.listen(PORT, HOST, () => {
		logger.log(
			`Application is running on: http://${HOST}:${PORT} in ${ENV} mode`
		)
	})
}
bootstrap()
