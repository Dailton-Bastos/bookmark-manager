import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { BadRequestException, Injectable } from '@nestjs/common'

@Injectable()
export class StorageService {
	private readonly uploadsDir: string

	constructor() {
		this.uploadsDir = path.join(process.cwd(), 'uploads')
	}

	async saveFile(
		file: File,
		subFolder: string
	): Promise<{ fileName: string; filePath: string }> {
		const allowedTypes = new Set([
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/webp'
		])

		if (!allowedTypes.has(file.type)) {
			throw new BadRequestException(
				'Invalid file type. Please upload a JPEG, JPG, PNG, or WebP image.'
			)
		}

		const targetDir = path.join(this.uploadsDir, subFolder)

		await fs.mkdir(targetDir, { recursive: true })

		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
		const fileExtension = path.extname(file.name) || '.png' // Default to .png if no extension is found
		const fileName = `${uniqueSuffix}${fileExtension}`
		const filePath = path.join(targetDir, fileName)

		const arrayBuffer = await file.arrayBuffer()

		await fs.writeFile(filePath, Buffer.from(arrayBuffer))

		return { fileName, filePath }
	}
}
