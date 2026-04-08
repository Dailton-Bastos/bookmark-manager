import { Badge } from 'ui/components/shadcn/ui/badge'
import { Checkbox } from 'ui/components/shadcn/ui/checkbox'
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldSet
} from 'ui/components/shadcn/ui/field'
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from 'ui/components/shadcn/ui/sidebar'

interface NavTagsProps {
	tags: { name: string; quantity: number }[]
}

export const NavTags = ({ tags }: NavTagsProps) => {
	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden pt-1 px-0 text-muted-foreground">
			<SidebarGroupLabel className="font-bold uppercase">
				Tags
			</SidebarGroupLabel>
			<SidebarMenu>
				<FieldSet>
					<FieldGroup className="gap-0">
						{tags.map((tag) => (
							<SidebarMenuItem key={tag.name}>
								<SidebarMenuButton asChild className="h-10.5">
									<Field orientation="horizontal">
										<Checkbox
											id={`tag-${tag.name}`}
											name={`tag-${tag.name}`}
											className="border-checkbox cursor-pointer rounded-sm focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring/60"
										/>
										<FieldLabel
											htmlFor={`tag-${tag.name}`}
											className="flex items-center gap-2 justify-between text-base font-semibold"
										>
											{tag.name}
											<Badge
												variant="secondary"
												className="border-muted font-medium"
											>
												{tag.quantity}
											</Badge>
										</FieldLabel>
									</Field>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</FieldGroup>
				</FieldSet>
			</SidebarMenu>
		</SidebarGroup>
	)
}
