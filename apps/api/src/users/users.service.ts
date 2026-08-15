import { Inject, Injectable } from '@nestjs/common'
import type { UserProfile } from '@repo/schemas'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres/driver'
import { CacheProvider } from '../cache/cache.provider'
import { schema } from '../database/schemas'
import { USER_PROFILE_CACHE_KEY } from '../shared/constants/cache'
import { DATABASE_CONNECTION } from '../shared/constants/database'

@Injectable()
export class UsersService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		private readonly db: NodePgDatabase<typeof schema>,
		private readonly cacheProvider: CacheProvider
	) {}

	async getProfile(userId: string): Promise<UserProfile | null> {
		const cacheKey = `${USER_PROFILE_CACHE_KEY}_${userId}`
		const ttl = 3_600_000 // Cache for 1 hour in milliseconds

		// Check if the profile is cached
		const cachedProfile = await this.cacheProvider.get<UserProfile | null>(
			cacheKey
		)

		if (cachedProfile !== undefined) return cachedProfile

		// Fetch the user profile from the database
		const userProfile = await this.db
			.select()
			.from(schema.users)
			.where(eq(schema.users.id, userId))

		if (userProfile.length === 0) {
			await this.cacheProvider.set<null>(cacheKey, null, ttl)

			return null
		}

		const profile = userProfile[0]

		if (!profile) {
			await this.cacheProvider.set<null>(cacheKey, null, ttl)

			return null
		}

		// Cache the user profile for future requests
		await this.cacheProvider.set<UserProfile>(cacheKey, profile, ttl)

		return profile
	}
}
