import Image from 'next/image'
import { FileUpload } from 'ui/components/file-upload'
import { X } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'

interface ImageUploadProps {
	onFileSelected: (file: File) => void
	clearSelection: () => void
	preview: string | null
	isPending?: boolean
}

export const ImageUpload = ({
	onFileSelected,
	clearSelection,
	preview,
	isPending
}: ImageUploadProps) => {
	if (!preview) return <FileUpload onFileSelected={onFileSelected} />

	return (
		<div className="space-y-4">
			<div className="relative w-18 h-18 md:w-32 md:h-32 rounded-lg text-center">
				<Image
					src={preview}
					alt="Preview"
					width={256}
					height={256}
					className="rounded-lg object-cover w-full h-full"
				/>

				<Button
					type="button"
					aria-label="Remove selected image"
					variant="secondary"
					className="w-6 h-6 absolute top-1 right-1 cursor-pointer bg-popover rounded-lg shadow-md hover:bg-gray-100"
					onClick={clearSelection}
					disabled={isPending}
				>
					<X className="size-3" />
				</Button>
			</div>
		</div>
	)
}
