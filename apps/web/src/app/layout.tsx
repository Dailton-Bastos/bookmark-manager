import type { Metadata } from 'next'
import { manrope, roboto } from './fonts'
import './globals.css'

export const metadata: Metadata = {
	title: 'Bookmark Manager',
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
			className={`${manrope.variable} ${roboto.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
