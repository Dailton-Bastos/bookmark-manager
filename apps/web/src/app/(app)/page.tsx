import { SortByDropdown } from '@/components/app/sort-by-dropdown'

const Home = () => {
	return (
		<div className="w-full p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">All bookmarks</h1>
				<div className="ml-auto flex items-center gap-4">
					<SortByDropdown />
				</div>
			</div>
		</div>
	)
}

export default Home
