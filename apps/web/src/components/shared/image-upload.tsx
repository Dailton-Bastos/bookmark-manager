import Image from 'next/image'
import { FileUpload } from 'ui/components/file-upload'
import { X } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'

interface ImageUploadProps {
	onFileSelected: (file: File) => void
	clearSelection: () => void
	preview: string | null
}

export const ImageUpload = ({
	onFileSelected,
	clearSelection,
	preview
}: ImageUploadProps) => {
	if (!preview) return <FileUpload onFileSelected={onFileSelected} />

	return (
		<div className="space-y-4">
			<div className="relative w-32 h-32 rounded-lg text-center">
				<Image
					src={preview}
					alt="Preview"
					width={64}
					height={64}
					className="rounded-lg object-cover w-full h-full"
				/>

				<Button
					variant="secondary"
					className="w-6 h-6 absolute top-1 right-1 cursor-pointer bg-white rounded-lg shadow-md hover:bg-gray-100"
					onClick={clearSelection}
				>
					<X className="size-3" />
				</Button>
			</div>
		</div>
	)
}
