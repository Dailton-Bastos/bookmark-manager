import { AsyncLocalStorage } from 'node:async_hooks'
import type { Request } from 'express'

export const requestContextStorage: AsyncLocalStorage<Request> =
	new AsyncLocalStorage<Request>()
