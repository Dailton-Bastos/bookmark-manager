import { EnvService } from '../env/env.service'

export const helpersHandlebars = (envService: EnvService) => ({
	logoUrl: () => `${envService.get('UI_URL')}/static/logo.svg`
})
