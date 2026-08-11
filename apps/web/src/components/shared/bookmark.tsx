import type { Bookmark as BookmarkProps } from '@repo/schemas'
import Image from 'next/image'
import { useState } from 'react'
import { Calendar, Clock, Eye, Pin } from 'ui/components/icons'
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
import { removePrefixesFromUrl } from '@/utils/remove-prefixes-from-url'
import { truncateString } from '@/utils/truncate-string'
import { BookmarkDropdown } from '../app/bookmark-dropdown'

interface Props {
	bookmark: BookmarkProps
	handlePinUnpinBookmark: (bookmarkId: number, pinned: boolean) => Promise<void>
	handleVisitedBookmark: (bookmarkId: number) => Promise<void>
}

export const Bookmark = ({
	bookmark,
	handlePinUnpinBookmark,
	handleVisitedBookmark
}: Props) => {
	const {
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
	} = bookmark

	const [faviconNotFound, setFaviconNotFound] = useState(false)

	const faviconUrl = faviconNotFound ? '/world.png' : favicon || '/world.png'

	return (
		<Card className="@container/card p-4 pb-3 gap-3 min-h-68">
			<CardHeader className="p-0 pb-1 gap-0">
				<div className="flex items-center gap-3">
					<Image
						src={faviconUrl}
						alt={`Favicon for ${title}`}
						width={44}
						height={44}
						onError={() => setFaviconNotFound(true)}
						className="rounded-lg object-cover w-11 h-11 border border-muted"
					/>

					<div className="w-full min-w-0">
						<CardTitle
							className="text-lg font-bold font-sans text-foreground min-w-0 truncate"
							title={title}
						>
							{truncateString(title, 30)}
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground font-medium min-w-0 truncate">
							{truncateString(removePrefixesFromUrl(url), 35)}
						</CardDescription>
					</div>
				</div>

				<CardAction className="mt-1 ml-3">
					<BookmarkDropdown
						bookmark={bookmark}
						handlePinUnpinBookmark={handlePinUnpinBookmark}
						handleVisitedBookmark={handleVisitedBookmark}
					/>
				</CardAction>
			</CardHeader>

			<Separator />

			<CardContent className="px-0 py-1">
				<p className="text-muted-foreground font-medium text-sm text-justify line-clamp-4">
					{description}
				</p>

				{tags && tags.length > 0 && (
					<div className="flex items-center flex-wrap gap-2 mt-4">
						{tags.map((tag) => (
							<Badge
								key={tag.id}
								variant="secondary"
								className="rounded-sm text-muted-foreground"
							>
								{tag.name}
							</Badge>
						))}
					</div>
				)}
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

					<div className="flex items-center">
						<Clock className="size-3 mr-1.5 text-muted-foreground" />
						<span className="text-muted-foreground font-medium text-xs">
							{lastVisited
								? formatDate(new Date(lastVisited).toISOString())
								: 'Never'}
						</span>
					</div>

					<div className="flex items-center">
						<Calendar className="size-3 mr-1.5 text-muted-foreground" />
						<span className="text-muted-foreground font-medium text-xs">
							{formatDate(new Date(createdAt).toISOString())}
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
