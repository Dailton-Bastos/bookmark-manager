import { useState } from 'react'
import { toast } from 'sonner'

export const useTagInput = ({ maxTags = 5 }: { maxTags?: number }) => {
	const [tags, setTags] = useState<string[]>([])

	const addTag = (tag: string) => {
		setTags((prevTags) => {
			if (prevTags.length >= maxTags) {
				toast.error(`You can only add up to ${maxTags} tags.`)
				return prevTags
			}

			if (prevTags.includes(tag)) {
				toast.error('This tag has already been added.')
				return prevTags
			}

			return [...prevTags, tag]
		})
	}

	const removeTag = (tag: string) => {
		setTags((prevTags) => prevTags.filter((t) => t !== tag))
	}

	return { tags, addTag, removeTag }
}
