import type React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import Home from './page'

vi.mock('next/image', () => ({
	default: ({
		priority: _priority,
		...props
	}: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
		// biome-ignore lint/performance/noImgElement: <Only for testing purposes>
		<img {...props} alt="test" />
	)
}))

describe('Home page', () => {
	it('renders the starter headline and primary navigation links', () => {
		const html = renderToStaticMarkup(<Home />)

		expect(html).toContain('To get started, edit the page.tsx file.')
		expect(html).toContain('Templates')
		expect(html).toContain('Learning')
		expect(html).toContain('Documentation')
		expect(html).toContain('Deploy Now')
		expect(html).toContain('https://nextjs.org/docs')
	})
})
