import type { Session, User } from 'better-auth'
import { createContext, useContext } from 'react'

interface SessionProviderProps {
	children: React.ReactNode
	data: {
		user: User
		session: Session
	}
}

const SessionContext = createContext<SessionProviderProps['data']>(
	{} as SessionProviderProps['data']
)

export const SessionProvider = ({
	children,
	data
}: Readonly<SessionProviderProps>) => {
	return (
		<SessionContext.Provider value={data}>{children}</SessionContext.Provider>
	)
}

export const useSession = () => {
	const context = useContext(SessionContext)

	if (context === undefined) {
		throw new Error('useSession must be used within a SessionProvider')
	}

	return context
}
