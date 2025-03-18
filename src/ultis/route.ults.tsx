import { useParams, useRouter } from 'next/navigation'

export function useLocalePath() {
	const params = useParams()
	const router = useRouter()
	const locale = params?.locale || 'en'
	const handleGetPath = (path?: string) => {
		const cleanPath = path ? path.replace(/^\/+/, '') : '' // Xóa dấu `/` ở đầu nếu có
		return cleanPath ? `/${locale}/${cleanPath}` : `/${locale}`
	}
	const handleChangeRoute = (path?: string) => {
		router.push(handleGetPath(path))
	}

	return {
		onGetPath: handleGetPath,
		onChangeRoute: handleChangeRoute,
	}
}
