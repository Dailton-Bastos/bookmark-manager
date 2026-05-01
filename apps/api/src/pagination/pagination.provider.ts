import { Injectable } from '@nestjs/common'
import type { PaginationMeta, PaginationQuery } from '@repo/schemas'

interface PaginationResponse<T> {
	data: T[]
	meta: PaginationMeta
}

@Injectable()
export class PaginationProvider {
	public paginateQuery<T>({
		paginationQuery,
		totalCount,
		data
	}: {
		paginationQuery: PaginationQuery
		totalCount: number
		data: T[]
	}): PaginationResponse<T> {
		const response: PaginationResponse<T> = {
			data,
			meta: {
				itemsPerPage: paginationQuery.limit,
				currentPage: paginationQuery.page,
				totalItems: totalCount,
				totalPages: Math.ceil(totalCount / paginationQuery.limit),
				hasNextPage: paginationQuery.page * paginationQuery.limit < totalCount,
				hasPreviousPage: paginationQuery.page > 1
			}
		}

		return response
	}
}
