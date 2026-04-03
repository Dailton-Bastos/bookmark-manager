import { CustomDecorator, SetMetadata } from '@nestjs/common'

export const AllowAnonymous = (): CustomDecorator<string> =>
	SetMetadata('public', true)
