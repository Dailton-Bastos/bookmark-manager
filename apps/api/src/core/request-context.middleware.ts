import { Injectable, type NestMiddleware } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
import { requestContextStorage } from '../shared/request-context'

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
	use(req: Request, _res: Response, next: NextFunction) {
		requestContextStorage.run(req, next)
	}
}
