import Image from 'next/image'
import { Calendar, Clock, Eye, Globe, Pin } from 'ui/components/icons'
import { Badge } from 'ui/components/shadcn/ui/badge'
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from 'ui/components/shadcn/ui/card'
import { Separator } from 'ui/components/shadcn/ui/separator'
import { formatDate } from '@/utils/format-date'
import { BookmarkDropdown } from '../app/bookmark-dropdown'

interface Bookmark {
	id: string
	title: string
	url: string
	favicon: string | null
	description: string
	tags: string[]
	pinned: boolean
	isArchived: boolean
	visitCount: number
	createdAt: string
	lastVisited: string | null
}

interface BookmarkProps extends Bookmark {}

export const Bookmark = ({
	title,
	url,
	favicon,
	description,
	tags,
	pinned,
	isArchived,
	visitCount,
	createdAt,
	lastVisited
}: BookmarkProps) => {
	return (
		<Card className="@container/card p-4 pb-3 gap-3 min-h-68">
			<CardHeader className="p-0 pb-1 gap-0">
				<div className="flex items-center gap-3">
					{favicon ? (
						<Image
							src={favicon}
							alt={title}
							width={44}
							height={44}
							unoptimized
						/>
					) : (
						<Globe className="size-11" />
					)}

					<div className="w-full min-w-0">
						<CardTitle className="text-lg font-bold font-sans text-foreground">
							{title}
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground font-medium min-w-0 truncate">
							{url}
						</CardDescription>
					</div>
				</div>

				<CardAction className="mt-1 ml-3">
					<BookmarkDropdown pinned={pinned} isArchived={isArchived} url={url} />
				</CardAction>
			</CardHeader>

			<Separator />

			<CardContent className="px-0 py-1">
				<p className="text-muted-foreground font-medium text-sm text-justify line-clamp-4">
					{description}
				</p>

				<div className="flex items-center flex-wrap gap-2 mt-4">
					{tags.map((tag) => (
						<Badge
							key={tag}
							variant="secondary"
							className="rounded-sm text-muted-foreground"
						>
							{tag}
						</Badge>
					))}
				</div>
			</CardContent>

			<Separator className="mt-auto" />

			<CardFooter className="flex items-center justify-between w-full p-0">
				<div className="flex items-start gap-4">
					<div className="flex items-center">
						<Eye className="size-3 mr-1.5 text-muted-foreground" />
						<span className="text-muted-foreground font-medium text-xs">
							{visitCount}
						</span>
					</div>

					{lastVisited && (
						<div className="flex items-center">
							<Clock className="size-3 mr-1.5 text-muted-foreground" />
							<span className="text-muted-foreground font-medium text-xs">
								{formatDate(lastVisited)}
							</span>
						</div>
					)}

					<div className="flex items-center">
						<Calendar className="size-3 mr-1.5 text-muted-foreground" />
						<span className="text-muted-foreground font-medium text-xs">
							{formatDate(createdAt)}
						</span>
					</div>
				</div>

				<div className="ml-auto flex items-center">
					{pinned && !isArchived && (
						<Pin className="size-4 text-muted-foreground" />
					)}

					{isArchived && (
						<Badge
							variant="secondary"
							className="rounded-sm text-muted-foreground"
						>
							Archived
						</Badge>
					)}
				</div>
			</CardFooter>
		</Card>
	)
}
