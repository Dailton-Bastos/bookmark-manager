import Image from 'next/image'

export const Logo = () => {
	return (
		<div className="flex items-center gap-2">
			<Image
				src="/bookmark.svg"
				alt="Bookmark Manager Logo"
				width={32}
				height={32}
				className="w-8 h-8"
				unoptimized
			/>

			<span className="text-xl font-bold font-roboto">Bookmark Manager</span>
		</div>
	)
}
