import type { CreateBookmark } from '@repo/schemas'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { X } from 'ui/components/icons'
import { InputTag } from 'ui/components/input-tag'
import { Badge } from 'ui/components/shadcn/ui/badge'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel
} from 'ui/components/shadcn/ui/field'
import { Input } from 'ui/components/shadcn/ui/input'
import { Textarea } from 'ui/components/shadcn/ui/textarea'
import { useTagInput } from '@/hooks/useTagInput'

const MAX_TAGS = 10

export const AddBookmarkForm = () => {
	const {
		register,
		setValue,
		watch,
		formState: { errors }
	} = useFormContext<CreateBookmark>()

	const { tags, addTag, removeTag } = useTagInput({ maxTags: MAX_TAGS })

	const description = watch('description')

	useEffect(() => {
		register('tags')
	}, [register])

	useEffect(() => {
		setValue('tags', tags)
	}, [tags, setValue])

	return (
		<FieldGroup className="gap-4">
			<Field className="gap-1.5" data-invalid={errors.url}>
				<FieldLabel htmlFor="url" className="text-foreground">
					Website URL *
				</FieldLabel>
				<Input
					{...register('url')}
					id="url"
					type="url"
					aria-invalid={errors.url ? 'true' : 'false'}
					autoComplete="off"
					required
					className="hover:bg-secondary focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring/60"
				/>
				{errors.url && (
					<FieldError errors={[errors.url]} className="font-medium" />
				)}
			</Field>

			<Field className="gap-1.5" data-invalid={errors.title}>
				<FieldLabel htmlFor="title" className="text-foreground">
					Title *
				</FieldLabel>
				<Input
					{...register('title')}
					id="title"
					type="text"
					aria-invalid={errors.title ? 'true' : 'false'}
					autoComplete="off"
					required
					className="hover:bg-secondary focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring/60"
				/>
				{errors.title && (
					<FieldError errors={[errors.title]} className="font-medium" />
				)}
			</Field>

			<Field className="gap-1.5" data-invalid={errors.description}>
				<FieldLabel htmlFor="description" className="text-foreground">
					Description
				</FieldLabel>
				<Textarea
					{...register('description')}
					id="description"
					aria-invalid={errors.description ? 'true' : 'false'}
					maxLength={280}
					rows={4}
					autoComplete="off"
					className="min-h-22.5 hover:bg-secondary border border-chart-2 focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring/60"
				/>
				<FieldDescription className="text-right">
					{description ? `${description.length}/280` : '0/280'}
				</FieldDescription>
				{errors.description && (
					<FieldError errors={[errors.description]} className="font-medium" />
				)}
			</Field>

			<Field className="gap-1.5" data-invalid={errors.tags}>
				<FieldLabel htmlFor="tags" className="text-foreground">
					Tags
				</FieldLabel>
				<div className="w-full">
					<InputTag
						addTag={addTag}
						aria-invalid={errors.tags ? 'true' : 'false'}
						id="tags"
						placeholder='e.g. "work", "personal", "react"'
						disabled={tags.length >= MAX_TAGS}
					/>
					{errors.tags &&
						Array.isArray(errors.tags) &&
						errors.tags.length > 0 &&
						errors.tags.map((error) => (
							<FieldError
								key={`tag-error-${Date.now()}`}
								errors={[error]}
								className="font-medium"
							/>
						))}
					<FieldDescription className="text-xs text-muted-foreground pt-2">
						Press "Enter" or "Space" to add a tag (Up to {MAX_TAGS} tags).
					</FieldDescription>
				</div>

				<div className="flex flex-wrap gap-2 mt-2">
					{tags.map((tag) => (
						<Badge key={tag} variant="secondary">
							{tag}
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="ml-1 h-3 w-3 rounded-full p-0 text-muted-foreground cursor-pointer hover:bg-transparent disabled:pointer-events-none"
								onClick={() => removeTag(tag)}
								aria-label={`Remove tag ${tag}`}
							>
								<X className="h-3 w-3" />
							</Button>
						</Badge>
					))}
				</div>
			</Field>
		</FieldGroup>
	)
}
