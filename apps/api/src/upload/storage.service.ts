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
		if (!file.type.startsWith('image/')) {
			throw new BadRequestException(
				'Invalid file type. Only image files are allowed.'
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
