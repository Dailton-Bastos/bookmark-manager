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
	DATABASE_NAME: z.string().nonempty({ message: 'DATABASE_NAME is required' })
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
