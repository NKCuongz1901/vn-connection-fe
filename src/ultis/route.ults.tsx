import { useParams, usePathname, useRouter } from 'next/navigation'

export function useLocalePath() {
	const params = useParams()
	const router = useRouter()
	const pathname = usePathname() // Lấy path hiện tại

	const locale = params?.locale || 'en'
	const handleGetPath = (path?: string) => {
		const cleanPath = path ? path.replace(/^\/+/, '') : '' // Xóa dấu `/` ở đầu nếu có
		return cleanPath ? `/${locale}/${cleanPath}` : `/${locale}`
	}
	const handleChangeRoute = (path?: string) => {
		router.push(handleGetPath(path))
	}

	return {
		pathname: pathname,
		onGetPath: handleGetPath,
		onChangeRoute: handleChangeRoute,
	}
}
