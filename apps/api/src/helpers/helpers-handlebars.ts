import { EnvService } from '../env/env.service'

export const helpersHandlebars = (envService: EnvService) => ({
	logoUrl: () =>
		`${new URL('/static/logo.svg', envService.get('UI_URL')).toString()}`
})
