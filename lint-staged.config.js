const path = require('node:path')

module.exports = {
	// Handle apps separately with proper directory context
	'apps/**/*.{js,jsx,ts,tsx}': (filenames) => {
		const filesByApp = filenames.reduce((acc, filename) => {
			const match = filename.match(/(?:^|\/)apps\/([^/]+)\/(.+)/)
			if (!match) return acc

			const appName = match[1]
			if (!acc[appName]) acc[appName] = []
			acc[appName].push(filename)
			return acc
		}, {})

		// Use proper shell command format
		return Object.entries(filesByApp).flatMap(([appName, files]) => {
			const appDir = `apps/${appName}`
			const relativeFiles = files.map((file) => path.relative(appDir, file))

			console.log(
				`🔍 Linting ${files.length} staged files in ${appDir}:`,
				relativeFiles
			)

			return [
				// Method 1: Use shell: true format
				`bash -c "cd ${appDir} && biome lint --write --no-errors-on-unmatched "${relativeFiles.join(' ')}""`,
				`bash -c "cd ${appDir} && biome format --write --no-errors-on-unmatched "${relativeFiles.join(' ')}""`
			]
		})
	},

	// Handle packages separately
	'packages/**/*.{js,jsx,ts,tsx}': (filenames) => {
		const filesByPackage = filenames.reduce((acc, filename) => {
			// Exclude shadcn components as they are not meant to be linted/formatting by us
			if (filename.includes('ui/src/components/shadcn')) return acc

			const match = filename.match(/(?:^|\/)packages\/([^/]+)\/(.+)/)
			if (!match) return acc

			if (match[1] === 'biome-config' || match[1] === 'typescript-config')
				return acc

			const pkgName = match[1]
			if (!acc[pkgName]) acc[pkgName] = []
			acc[pkgName].push(filename)
			return acc
		}, {})

		return Object.entries(filesByPackage).flatMap(([pkgName, files]) => {
			const pkgDir = `packages/${pkgName}`
			const relativeFiles = files.map((file) => path.relative(pkgDir, file))

			console.log(
				`📦 Linting ${files.length} staged files in ${pkgDir}:`,
				relativeFiles
			)

			return [
				`bash -c "cd ${pkgDir} && biome lint --write --no-errors-on-unmatched "${relativeFiles.join(' ')}""`,
				`bash -c "cd ${pkgDir} && biome format --write --no-errors-on-unmatched "${relativeFiles.join(' ')}""`
			]
		})
	},

	// Root level files
	'*.{json,md,yml,yaml}': ['biome check --write --no-errors-on-unmatched']
}
