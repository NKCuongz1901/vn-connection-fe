import { useParams, usePathname, useRouter } from 'next/navigation'

export function useLocalePath() {
	const params = useParams()
	const router = useRouter()
	const localePathname = usePathname() // Lấy path hiện tại
	const pathname = localePathname.split('/').slice(2).join('/')

	const locale = params?.locale || 'en'
	const handleGetPath = (path: string) => {
		const cleanPath = path ? path.replace(/^\/+/, '') : '' // Xóa dấu `/` ở đầu nếu có
		return cleanPath ? `/${locale}/${cleanPath}` : `/${locale}`
	}
	const handleChangeRoute = (path: string) => {
		router.push(handleGetPath(path))
	}
	const handleGetParam = () => {
		return params || []
	}
	return {
		pathname: pathname,
		localePathname: localePathname,
		onGetPath: handleGetPath,
		onChangeRoute: handleChangeRoute,
		onGetParam: handleGetParam,
	}
}

export const useSafeBack = () => {
	const router = useRouter()
	const { onChangeRoute } = useLocalePath()
	const goBackOrPush = (fallbackUrl: string) => {
		const referrer = document.referrer
		const currentOrigin = window.location.origin
		if (referrer && referrer.startsWith(currentOrigin)) {
			router.back()
		} else {
			onChangeRoute(fallbackUrl)
		}
	}

	return { goBackOrPush }
}
