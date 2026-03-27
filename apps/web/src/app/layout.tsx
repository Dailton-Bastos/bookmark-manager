import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
	variable: '--font-manrope',
	weight: ['400', '500', '600', '700'],
	subsets: ['latin']
})

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
		<html lang="en" className={`${manrope.variable} h-full antialiased`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
