/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /
 * @type {string[]}
 */
export const authRoutes: string[] = [
	'/login',
	'/signup',
	'/request-password-reset',
	'/reset-password'
]

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT: string = '/'

/**
 * The default redirect path for unauthenticated users
 * @type {string}
 */
export const DEFAULT_UNAUTHENTICATED_REDIRECT: string = '/login'
