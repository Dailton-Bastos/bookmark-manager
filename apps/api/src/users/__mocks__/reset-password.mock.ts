import { ResetPasswordFormData } from '@repo/schemas'

export const resetPasswordInputMock: ResetPasswordFormData = {
	newPassword: 'newPassword123',
	confirmNewPassword: 'newPassword123',
	token: 'valid-reset-token'
}
