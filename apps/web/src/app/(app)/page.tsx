'use client'

import { useSession } from '@/providers/session-provider'

const Home = () => {
	const { user } = useSession()

	return <h1>Dashboard - {user?.name}</h1>
}

export default Home
