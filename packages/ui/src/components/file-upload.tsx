/** biome-ignore-all lint/a11y/useSemanticElements: <> */
import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { Input } from "../components/shadcn/ui/input";

interface FileUploadProps {
	onFileSelected: (file: File) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const FileUpload = ({ onFileSelected }: FileUploadProps) => {
	const [fileErrorMessage, setFileErrorMessage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	const handleFile = (file: File) => {
		if (!file.type.startsWith("image/")) {
			setFileErrorMessage("Only image files are allowed.");
			return;
		}

		if (file.size > MAX_FILE_SIZE) {
			setFileErrorMessage(
				`Image size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
			);
			return;
		}

		onFileSelected(file);
		setFileErrorMessage(null);
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();

		const file = event.dataTransfer.files?.[0];

		if (!file) return;

		handleFile(file);
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();

		const file = event.target.files?.[0];

		if (!file) return;

		handleFile(file);
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="flex flex-col items-center justify-center w-full h-full">
			<div
				className="flex flex-col justify-center w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				onClick={handleClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						handleClick();
					}
				}}
				role="button"
				tabIndex={0}
			>
				<ImagePlus className="size-6 mx-auto text-muted-foreground" />

				<span className="text-xs text-muted-foreground">Add</span>

				<Input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={handleFileChange}
				/>
			</div>
			{fileErrorMessage && (
				<span className="text-xs text-red-500 mt-2 block">
					{fileErrorMessage}
				</span>
			)}
		</div>
	);
};
