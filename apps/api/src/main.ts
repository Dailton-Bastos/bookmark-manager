import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
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

	appConfig(app)

	const configService = app.get(EnvService)

	const PORT = configService.get('PORT')
	const HOST = configService.get('HOST')
	const ENV = configService.get('NODE_ENV')

	await app.listen(PORT, () => {
		logger.log(
			`Application is running on: http://${HOST}:${PORT} in ${ENV} mode`
		)
	})
}
bootstrap()
