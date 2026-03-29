import { Manrope, Roboto } from 'next/font/google'

export const manrope = Manrope({
	variable: '--font-manrope',
	weight: ['400', '500', '600', '700'],
	subsets: ['latin']
})

export const roboto = Roboto({
	variable: '--font-roboto',
	weight: '700',
	subsets: ['latin']
})
