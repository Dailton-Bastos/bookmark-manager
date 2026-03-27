import type { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'
import { appConfig } from '../src/config/app.config'

describe('Health (e2e)', () => {
	let app: INestApplication<App>

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile()

		app = module.createNestApplication<INestApplication>()

		appConfig(app)

		await app.init()
	})

	afterEach(async () => {
		await app.close()
	})

	it('/api/health (GET)', async () => {
		return request(app.getHttpServer())
			.get('/api/health')
			.expect(200)
			.expect((res) => {
				expect(res.body).toMatchObject({ status: 'ok' })
			})
	})
})
