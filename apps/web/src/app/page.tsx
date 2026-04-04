'use client'

import { toast } from 'sonner'
import { Button } from 'ui/components/shadcn/ui/button'

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<Button onClick={() => toast.success('Bookmark added successfully.')}>
				Test
			</Button>
		</div>
	)
}
