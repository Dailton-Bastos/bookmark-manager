import type { Metadata } from 'next'
import { manrope, roboto } from './fonts'
import './globals.css'
import { cn } from 'ui/lib/utils'
import { AppProvider } from '@/providers/app-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { APP_NAME } from '@/utils/constants'

export const metadata: Metadata = {
	title: {
		template: `%s | ${APP_NAME}`,
		default: APP_NAME
	},
	description: 'Add, organize, and manage your bookmarks with ease.'
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="en"
			className={cn(manrope.variable, roboto.variable, 'h-full antialiased')}
			suppressHydrationWarning
		>
			<body className="min-h-full flex flex-col">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<AppProvider>{children}</AppProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
