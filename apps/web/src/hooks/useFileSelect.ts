import { useState } from 'react'

export const useFileSelect = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [preview, setPreview] = useState<string | null>(null)

	const handleFileSelect = (file: File) => {
		setSelectedFile(file)
		const reader = new FileReader()
		reader.onloadend = () => {
			setPreview(reader.result as string)
		}
		reader.readAsDataURL(file)
	}

	const clearSelection = () => {
		setSelectedFile(null)
		setPreview(null)
	}

	return { selectedFile, preview, setPreview, handleFileSelect, clearSelection }
}
