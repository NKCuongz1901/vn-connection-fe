import { useParams } from 'next/navigation'

// export const handleChangeRoute = ()=>{
//     useRouter()
// }

export function useLocalePath() {
	const params = useParams()
	const locale = params?.locale || 'en'
	const handleGetPath = (path?: string) => {
		const cleanPath = path ? path.replace(/^\/+/, '') : '' // Xóa dấu `/` ở đầu nếu có
		return cleanPath ? `/${locale}/${cleanPath}` : `/${locale}`
	}
	return {
		onGetPath: handleGetPath,
	}
}
