import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from 'next/navigation'

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

export const useQuery = () => {
	const searchParams = useSearchParams()
	const params = useParams()

	const hangleGetQuerry = () => {
		const entries = Array.from(searchParams.entries())
		return Object.fromEntries(entries) || {} // trả về object toàn bộ query
	}
	const handleGetParams = (key?: string) => {
		if (!params) return key ? undefined : {}

		if (key) return params[key]
		return params
	}

	return {
		onGetQuerry: hangleGetQuerry,
		onGetParams: handleGetParams,
	}
}
export const handleGoToPage = (...args) => {
	if (typeof window !== 'undefined') {
		window.open(...args)
	}
}
export const goToGoogleMap = ({ lat, lng }: { lat: number; lng: number }) => {
	if (typeof window !== 'undefined') {
		const url = `https://www.google.com/maps?q=${lat},${lng}`
		handleGoToPage(url, '_blank')
	}
}
export const onPushState = (params: { [key: string]: any }) => {
	window.history.pushState({}, '', '?' + new URLSearchParams(params).toString())
}
