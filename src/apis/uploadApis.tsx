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

export const handleUploadImage = async (file) => {
	if (!file) return ''
	let url = ''
	try {
		const formData = new FormData()

		formData.set('image', file)
		const res = (await uploadProgress(formData)) as any
		const { code, results } = res || {}
		if (code === 200) {
			url = results?.object?.url
			return url
		}
	} catch (error) {
		throw error
	}
}
