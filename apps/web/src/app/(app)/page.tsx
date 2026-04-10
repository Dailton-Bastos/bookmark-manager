import { SortByDropdown } from '@/components/app/sort-by-dropdown'
import { SectionCards } from './_components/section-cards'

const Home = () => {
	return (
		<div className="w-full p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">All bookmarks</h1>
				<div className="ml-auto flex items-center gap-4">
					<SortByDropdown />
				</div>
			</div>

			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						<SectionCards />
					</div>
				</div>
			</div>
		</div>
	)
}

export default Home
