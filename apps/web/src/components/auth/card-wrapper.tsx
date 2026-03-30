import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from 'ui/components/shadcn/ui/card'
import { Logo } from '../shared/logo'

interface CardWrapperProps {
	children: React.ReactNode
	headerTitle: string
	headerDescription: string
}

export const CardWrapper = ({
	children,
	headerTitle,
	headerDescription
}: CardWrapperProps) => {
	return (
		<Card className="w-full mx-auto max-w-md px-8 py-10 gap-8 rounded-xl">
			<CardHeader className="p-0 w-full">
				<div className="pb-6">
					<Logo />
				</div>
				<CardTitle>
					<h1 className="text-2xl text-left font-bold text-foreground">
						{headerTitle}
					</h1>
				</CardTitle>
				<CardDescription className="text-sm text-left font-medium text-muted-foreground">
					{headerDescription}
				</CardDescription>
			</CardHeader>

			<CardContent className="p-0">{children}</CardContent>
		</Card>
	)
}
