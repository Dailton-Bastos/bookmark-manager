'use client'

import { Calendar, Clock, Eye, Globe, Pin } from 'ui/components/icons'
import { Badge } from 'ui/components/shadcn/ui/badge'
import { Button } from 'ui/components/shadcn/ui/button'
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
import { BookmarkDropdown } from '../app/bookmark-dropdown'

export const Bookmark = () => {
	return (
		<Card className="@container/card p-4 pb-3 gap-3">
			<CardHeader className="p-0 pb-1 gap-0">
				<div className="flex items-center gap-3">
					<Globe className="size-11" />

					<div className="flex flex-col">
						<CardTitle className="text-xl font-bold font-sans text-foreground">
							Frontend Mentor
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground font-medium">
							frontendmentor.io
						</CardDescription>
					</div>
				</div>

				<CardAction className="mt-1">
					<BookmarkDropdown />
				</CardAction>
			</CardHeader>

			<Separator />

			<CardContent className="px-0 py-1">
				<p className="text-muted-foreground font-medium text-sm text-justify line-clamp-4">
					Improve your front-end coding skills by building real projects. Solve
					real-world HTML, CSS and JavaScript challenges whilst working to
					professional designs.
				</p>

				<div className="flex items-center flex-wrap gap-2 mt-4">
					<Badge
						variant="secondary"
						className="rounded-sm text-muted-foreground"
					>
						HTML
					</Badge>
					<Badge
						variant="secondary"
						className="rounded-sm text-muted-foreground"
					>
						CSS
					</Badge>
					<Badge
						variant="secondary"
						className="rounded-sm text-muted-foreground"
					>
						JavaScript
					</Badge>
				</div>
			</CardContent>

			<Separator />

			<CardFooter className="flex items-center justify-between w-full p-0">
				<div className="flex items-start gap-4">
					<div className="flex items-center">
						<Eye className="size-3 mr-1.5 text-muted-foreground" />
						<span className="text-muted-foreground font-medium text-xs">
							57
						</span>
					</div>
					<div className="flex items-center">
						<Clock className="size-3 mr-1.5 text-muted-foreground" />
						<span className="text-muted-foreground font-medium text-xs">
							23 Sep
						</span>
					</div>
					<div className="flex items-center">
						<Calendar className="size-3 mr-1.5 text-muted-foreground" />
						<span className="text-muted-foreground font-medium text-xs">
							15 Jan
						</span>
					</div>
				</div>

				<div className="ml-auto flex items-center">
					<Button
						size="icon-xs"
						variant="ghost"
						className="ml-auto rounded-sm cursor-pointer hover:bg-transparent"
						title="Pin Bookmark"
					>
						<Pin className="size-4 text-muted-foreground" />
					</Button>
				</div>
			</CardFooter>
		</Card>
	)
}
