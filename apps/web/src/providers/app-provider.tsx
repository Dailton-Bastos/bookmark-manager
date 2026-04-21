'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { LoadingBarContainer } from 'react-top-loading-bar'
import { Check, LoaderCircle, X } from 'ui/components/icons'
import { Toaster } from 'ui/components/shadcn/ui/sonner'
import { TooltipProvider } from 'ui/components/shadcn/ui/tooltip'
import { ModalProvider } from './modal-provider'

const queryClient = new QueryClient()

export const AppProvider = ({
	children
}: Readonly<{
	children: React.ReactNode
}>) => {
	return (
		<QueryClientProvider client={queryClient}>
			<LoadingBarContainer
				props={{
					shadow: false,
					color: 'var(--primary)',
					loaderSpeed: 600
				}}
			>
				<TooltipProvider>{children}</TooltipProvider>
			</LoadingBarContainer>
			<Toaster
				position="top-right"
				toastOptions={{
					classNames: {
						toast: 'px-4! py-[9px]! rounded-lg! shadow-lg!',
						title: 'text-foreground! text-sm! font-medium! font-sans!',
						description: 'font-sans!',
						closeButton:
							'bg-transparent! border-0! opacity-50! hover:bg-secondary! left-auto! right-1! top-4!'
					}
				}}
				icons={{
					success: <Check className="size-4" />,
					loading: <LoaderCircle className="size-4 animate-spin" />,
					close: <X className="size-4 stroke-foreground" />
				}}
				closeButton
			/>
			<ModalProvider />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	)
}
