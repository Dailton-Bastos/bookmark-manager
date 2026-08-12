import z from 'zod'

export enum Environment {
	Development = 'development',
	Production = 'production',
	Test = 'test'
}

const envSchema = z.object({
	NODE_ENV: z
		.enum([Environment.Development, Environment.Production, Environment.Test], {
			message: "NODE_ENV must be one of 'development', 'production', or 'test'"
		})
		.default(Environment.Development),
	PORT: z.coerce.number().default(3001),
	HOST: z.string().default('localhost'),
	DATABASE_HOST: z.string().nonempty({ message: 'DATABASE_HOST is required' }),
	DATABASE_PORT: z.coerce.number().default(5432),
	DATABASE_USER: z.string().nonempty({ message: 'DATABASE_USER is required' }),
	DATABASE_PASSWORD: z
		.string()
		.nonempty({ message: 'DATABASE_PASSWORD is required' }),
	DATABASE_NAME: z.string().nonempty({ message: 'DATABASE_NAME is required' }),
	DATABASE_URL: z.string().nonempty().optional(),
	BETTER_AUTH_URL: z.url({
		protocol: /^https?$/,
		message: 'BETTER_AUTH_URL must be a valid URL'
	}),
	BETTER_AUTH_SECRET: z
		.string()
		.nonempty({ message: 'BETTER_AUTH_SECRET is required' }),
	UI_URL: z.url({
		protocol: /^https?$/,
		message: 'UI_URL must be a valid URL'
	}),
	API_URL: z.url({
		protocol: /^https?$/,
		message: 'API_URL must be a valid URL'
	}),
	REDIS_URL: z.url({
		protocol: /^rediss?$/,
		message: 'REDIS_URL must be a valid redis:// or rediss:// URL'
	}),
	CACHE_TTL: z.coerce.number().default(60000),
	BRANDFETCH_API_CLIENT: z
		.string()
		.nonempty({ message: 'BRANDFETCH_API_CLIENT is required' })
})

export const validate = (config: Record<string, unknown>) => {
	const validatedConfig = envSchema.safeParse(config)

	if (!validatedConfig.success) {
		throw new Error(
			`Invalid environment variables: ${validatedConfig.error.message}`
		)
	}

	return validatedConfig.data
}

export type EnvConfig = z.infer<typeof envSchema>
