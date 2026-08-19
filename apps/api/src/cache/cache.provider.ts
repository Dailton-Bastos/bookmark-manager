import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class CacheProvider {
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

	async get<T>(key: string): Promise<T | undefined> {
		return this.cacheManager.get<T>(key)
	}

	async set<T>(key: string, value: T, ttl?: number): Promise<void> {
		await this.cacheManager.set(key, value, ttl)
	}

	async del(key: string): Promise<void> {
		await this.cacheManager.del(key)
	}

	async registerAndCacheResult<T>({
		registryKey,
		cacheKey,
		result,
		ttl
	}: {
		registryKey: string
		cacheKey: string
		result: T
		ttl?: number
	}): Promise<void> {
		// Read the registry before caching to minimise the window for concurrent
		// writes to miss each other's keys (best-effort; not fully atomic).
		const existingKeys =
			(await this.cacheManager.get<string[]>(registryKey)) ?? []

		await this.cacheManager.set(cacheKey, result, ttl)

		if (!existingKeys.includes(cacheKey)) {
			await this.cacheManager.set(registryKey, [...existingKeys, cacheKey], ttl)
		}
	}

	async invalidateOwnerCache({
		registryKey
	}: {
		registryKey: string
	}): Promise<void> {
		const cachedKeys = await this.cacheManager.get<string[]>(registryKey)

		if (cachedKeys && cachedKeys.length > 0) {
			await Promise.all(cachedKeys.map((key) => this.cacheManager.del(key)))
			await this.cacheManager.del(registryKey)
		}
	}

	generateRegistryKey({
		ownerId,
		cacheKey
	}: {
		ownerId: string
		cacheKey: string
	}): string {
		return `${cacheKey}_${ownerId}_keys`
	}
}
