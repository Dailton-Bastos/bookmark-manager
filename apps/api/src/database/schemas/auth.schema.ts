import { relations } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from '../helpers/columns.helpers'
import { bookmarks } from './bookmark.schema'

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	image: text('image'),
	...timestamps
})

export const sessions = pgTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at').notNull(),
		token: text('token').notNull().unique(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		...timestamps
	},
	(table) => [index('sessions_userId_idx').on(table.userId)]
)

export const accounts = pgTable(
	'accounts',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		...timestamps
	},
	(table) => [index('accounts_userId_idx').on(table.userId)]
)

export const verifications = pgTable(
	'verifications',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		...timestamps
	},
	(table) => [index('verifications_identifier_idx').on(table.identifier)]
)

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	accounts: many(accounts),
	bookmarks: many(bookmarks)
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
	users: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
	users: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	})
}))
