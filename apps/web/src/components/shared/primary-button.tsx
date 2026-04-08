import type { LucideIcon } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import { cn } from 'ui/lib/utils'

interface PrimaryButtonProps extends React.ComponentProps<'button'> {
	title: string
	icon?: LucideIcon
}

export const PrimaryButton = ({
	className,
	title,
	icon: Icon,
	...props
}: PrimaryButtonProps) => {
	return (
		<Button
			type="submit"
			className={cn(
				'w-full h-11.5 has-[>svg]:px-4 rounded-lg hover:bg-chart-3 cursor-pointer font-semibold text-base',
				className
			)}
			{...props}
		>
			{Icon && <Icon className="size-5" />}
			{title}
		</Button>
	)
}
