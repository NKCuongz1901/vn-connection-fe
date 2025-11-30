import axios from '../axios'
const axiosUpload = axios.create() // không config Authorization

export const uploadProgress = async (
	file,
	// onUploadProgress?: (progressEvent: any) => void,
	// signal?: AbortSignal,
) => {
	try {
		const _file = await buildFileMetadata(file, 'image')
		const response = (await axios.post('files/pre-signed-url', _file)) as any
		const { result_url, upload_url } = response?.results?.object || {}
		await axiosUpload.put(upload_url, file, {
			headers: {
				'Content-Type': file.type,
				Authorization: undefined,
			},
		})

		return result_url
	} catch (error) {
		console.error('Upload failed:', error)
		throw error
	}
}
export const uploadProgressVideo = async (file) => {
	try {
		const _file = await buildFileMetadata(file, 'audio')
		const response = (await axios.post('files/pre-signed-url', _file)) as any
		const { result_url, upload_url } = response?.results?.object || {}
		await axiosUpload.put(upload_url, file, {
			headers: {
				'Content-Type': file.type,
				Authorization: undefined,
			},
		})

		return result_url
	} catch (error) {
		console.error('Upload failed:', error)
		throw error
	}
}

const buildFileMetadata = (file, fileTypeFromAPI) => {
	return new Promise((resolve) => {
		const fileName = file.name
		const fileSize = file.size
		const fileType = fileTypeFromAPI // bạn truyền vào, không cần detect

		// Ảnh → không cần seconds
		if (fileType === 'image') {
			return resolve({
				fileType,
				fileSize,
				fileName,
				file,
			})
		}

		// Video / Audio → lấy duration
		if (fileType === 'video' || fileType === 'audio') {
			const url = URL.createObjectURL(file)
			const media = document.createElement(fileType)
			media.preload = 'metadata'

			media.onloadedmetadata = () => {
				const seconds = Math.floor(media.duration)
				URL.revokeObjectURL(url)

				resolve({
					fileType,
					fileSize,
					fileName,
					seconds,
				})
			}

			media.src = url
			return
		}

		// File loại khác
		resolve({
			fileType,
			fileSize,
			fileName,
			seconds: null,
		})
	})
}

export const handleUploadVideo = async (file, _option = {}) => {
	if (!file) return ''
	// const { isAll } = option || ({} as any)
	try {
		const res = (await uploadProgressVideo(file)) as any
		return res
	} catch (error) {
		throw error
	}
}

export const handleUploadImage = async (file, _option = {}) => {
	if (!file) return ''
	// const { isAll } = option || ({} as any)
	try {
		const res = (await uploadProgress(file)) as any
		return res
	} catch (error) {
		throw error
	}
}
