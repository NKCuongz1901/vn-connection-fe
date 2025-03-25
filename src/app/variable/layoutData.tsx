import { mainRoutes } from '@/routes/MainRoutes'

export const appLayoutExclusive = ['/login', '/register', '/forget-password']
export const appLayoutAuth = [
	mainRoutes.login,
	mainRoutes.register,
	mainRoutes.forgetPassword,
]
