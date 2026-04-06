import { mainRoutes } from '@/routes/MainRoutes'

export const appLayoutExclusive = [
	'/login',
	'/register',
	'/forget-password',
	'/policy-term',
]
export const appLayoutAuth = [
	mainRoutes.login,
	mainRoutes.register,
	mainRoutes.forgetPassword,
	mainRoutes.policyTerm,
	'socketLogout',
]
