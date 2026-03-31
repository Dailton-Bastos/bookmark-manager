import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { appConfig } from './config/app.config'

async function bootstrap() {
	const logger = new Logger('Bootstrap')

	const app = await NestFactory.create<NestExpressApplication>(AppModule)
	app.enableShutdownHooks()

	appConfig(app)

	const configService = app.get<ConfigService>(ConfigService)

	const PORT = configService.get<number>('PORT') || 3001
	const HOST = configService.get<string>('HOST') || 'localhost'
	const ENV = configService.get<string>('NODE_ENV') || 'development'

	await app.listen(PORT, () => {
		logger.log(
			`Application is running on: http://${HOST}:${PORT} in ${ENV} mode`
		)
	})
}
bootstrap()
