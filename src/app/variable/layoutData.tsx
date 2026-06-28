import { mainRoutes } from '@/routes/MainRoutes'

export const appLayoutExclusive = [
	'/login',
	'/register',
	'/forget-password',
	'/term',
	'/policy',
	'/policy-term',
]
export const appLayoutAuth = [
	mainRoutes.login,
	mainRoutes.register,
	mainRoutes.forgetPassword,
	mainRoutes.term,
	mainRoutes.policy,
	'socketLogout',
	'open-app',
]

export const appLayoutPublic = [
	mainRoutes.publicEvent,
	mainRoutes.publicDiscussion,
]
