import axios from '../axios'
import { UPLOAD_ROUTES } from '@/routes'

export const uploadProgress = async (
	body: FormData,
	onUploadProgress?: (progressEvent: any) => void,
	signal?: AbortSignal,
) => {
	try {
		const response = await axios.post(UPLOAD_ROUTES.name, body, {
			onUploadProgress,
			...(signal && { signal }),
		})
		return response
	} catch (error) {
		console.error('Upload failed:', error)
		throw error
	}
}
