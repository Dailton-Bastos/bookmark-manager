'use client'

import type { UserProfile } from '@repo/schemas'
import {
	type UseMutationResult,
	useMutation,
	useQueryClient
} from '@tanstack/react-query'
import type { Session } from 'better-auth'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useMemo } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { DEFAULT_UNAUTHENTICATED_REDIRECT } from '@/routes'

interface SessionProviderProps {
	children: React.ReactNode
	data: {
		user: UserProfile
		session: Session
	}
}

interface SessionContextValue {
	user: UserProfile
	session: Session
	signOut: {
		mutateAsync: UseMutationResult<void, Error, void>['mutateAsync']
		isPending: UseMutationResult<void, Error, void>['isPending']
	}
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

export const SessionProvider = ({
	children,
	data
}: Readonly<SessionProviderProps>) => {
	const router = useRouter()

	const queryClient = useQueryClient()

	const signOutMutation = useMutation({
		mutationFn: async () => {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: async () => {
						await queryClient.invalidateQueries({ queryKey: ['session'] })
					},
					onError: (ctx) => {
						throw new Error(ctx.error.message)
					}
				}
			})
		},
		onSuccess: () => router.push(DEFAULT_UNAUTHENTICATED_REDIRECT),
		onError: () => toast.error('Failed to sign out. Please try again.')
	})

	const values = useMemo(
		() => ({
			...data,
			signOut: {
				mutateAsync: signOutMutation.mutateAsync,
				isPending: signOutMutation.isPending
			}
		}),
		[data, signOutMutation]
	)

	return (
		<SessionContext.Provider value={values}>{children}</SessionContext.Provider>
	)
}

export const useSession = () => {
	const context = useContext(SessionContext)

	if (context === undefined) {
		throw new Error('useSession must be used within a SessionProvider')
	}

	return context
}
