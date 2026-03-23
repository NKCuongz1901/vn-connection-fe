import { handleUploadImage } from '@/apis/uploadApis'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'

export const handleParseFileImg = (file) => {
	try {
		if (file?.type?.startsWith('image')) {
			const imageUrl = URL.createObjectURL(file)
			return {
				imageUrl,
				file,
			}
		}
	} catch (error) {
		console.log('error:', error)
	}
	return {}
}
export const handleParseFileVideo = async (file) => {
	try {
		if (file?.type?.startsWith('video')) {
			const duration: number = await new Promise((resolve) => {
				const video = document.createElement('video')
				video.preload = 'metadata'

				video.onloadedmetadata = () => {
					URL.revokeObjectURL(video.src)
					resolve(video.duration)
				}

				video.onerror = () => resolve(0)
				video.src = URL.createObjectURL(file)
			})

			if (duration <= 60) {
				const videoUrl = URL.createObjectURL(file)
				return {
					videoUrl,
					file,
				}
			}
		}
	} catch (error) {
		console.log('error:', error)
	}
	return {}
}

export const handleUploadMedia = async (fileList) => {
	const _medias = fileList
	let medias = []

	if (_medias?.length > 0) {
		const uploadPromises = _medias.map((media) =>
			handleUploadImage(media.file, { isAll: true }),
		)
		const resList = await Promise.all(uploadPromises)

		medias = (resList || []).map((i) => ({
			url: i,
			type: 'IMAGE',
			fileName: null,
			width: 692,
			height: 1500,
			ratio: 0.4613333333333333,
			thumbnail: null,
			duration: 0,
			...i,
		}))
	}

	return medias
}
export const handleConverUrlToAudio = async (url) => {
	try {
		const audio = document.createElement('audio')
		audio.src = url
		audio.crossOrigin = 'anonymous' // nên có

		await new Promise((resolve, reject) => {
			audio.addEventListener('loadeddata', resolve)
			audio.addEventListener('error', reject)
		})

		const res = await fetch(url)
		const blob = await res.blob()

		return new File([blob], 'audio.mp3', { type: blob.type })
	} catch (error) {
		console.log('🌸 handleConverUrlToAudio error:123123', error)
	}
}

/**
 * Chuyển đổi một URL trực tiếp thành một đối tượng File.
 * @param {string} audioUrl - URL của tệp audio.
 * @param {string} defaultFilename - Tên tệp mong muốn (ví dụ: 'my-audio.mp3').
 * @returns {Promise<File>} - Một Promise resolve với đối tượng File.
 */
export async function urlToAudioFile(audioUrl, defaultFilename = 'audio') {
	console.log(`Bắt đầu tải dữ liệu từ: ${audioUrl}`)

	try {
		// 1. Fetch: Thực hiện yêu cầu GET để lấy phản hồi từ server.
		const response = await fetch(audioUrl)

		if (!response.ok) {
			// Xử lý lỗi HTTP (ví dụ: 404 Not Found, 500 Internal Server Error)
			throw new Error(`Lỗi HTTP ${response.status}: Không thể tải audio.`)
		}

		// 2. Blob: Chuyển dữ liệu phản hồi thành Blob.
		// Blob là đối tượng chứa dữ liệu nhị phân thô của tệp.
		const audioBlob = await response.blob()
		console.log('Đã tạo Blob thành công. Kích thước:', audioBlob.size, 'bytes')

		// Lấy loại MIME thực tế từ headers, hoặc dùng mặc định
		const mimeType =
			response.headers.get('content-type') ||
			audioBlob.type ||
			'application/octet-stream'

		// 3. File: Tạo đối tượng File từ Blob.
		// File là một loại Blob nhưng có thêm thuộc tính name.
		const audioFile = new File([audioBlob], defaultFilename, { type: mimeType })

		console.log('Đã tạo đối tượng File:', audioFile)
		return audioFile
	} catch (error) {
		console.error('Lỗi khi chuyển đổi URL sang File:', error.message)
		throw error // Ném lại lỗi để có thể xử lý ở nơi gọi hàm
	}
}

const audioMap: Record<string, HTMLAudioElement> = {}
export const playAudio = (id: string, url: string, cb?: () => void): void => {
	let audio = audioMap[id]

	if (!audio) {
		// Trường hợp 1: Tạo đối tượng Audio mới
		audio = new Audio(url)
		audioMap[id] = audio
	}

	// Luôn gán lại (hoặc gỡ bỏ) callback MỚI NHẤT
	// Điều này phải được thực hiện trước khi gọi play()
	if (cb) {
		// Chỉ gán callback cho sự kiện ENDED
		audio.onended = () => {
			// Đảm bảo cb chỉ được gọi khi audio TỰ ĐỘNG kết thúc
			cb()
		}
	} else {
		// Nếu không truyền cb, gỡ bỏ cb cũ (nếu có)
		audio.onended = null
	}

	// Logic điều khiển Play/Pause

	// Nếu đang phát -> Tạm dừng (Pause)
	if (!audio.paused) {
		audio.pause()
		return
	}

	// Nếu đang tạm dừng (Paused) -> Phát lại (Play)

	// ⭐ ĐIỂM SỬA CHỮA QUAN TRỌNG:
	// Nếu audio đã phát hết (audio.ended == true), HOẶC đang ở cuối tệp
	// BẮT BUỘC phải reset currentTime về 0 để trình duyệt cho phép phát lại
	// và KHÔNG gọi onended ngay lập tức.
	if (audio.ended || audio.currentTime === audio.duration) {
		audio.currentTime = 0
	}

	// Phát audio
	audio.play()
}

export const stopAudio = (id: string): void => {
	const audio = audioMap[id]
	if (audio && !audio.paused) {
		audio.pause()
		audio.currentTime = 0
	}
}

export const handleCreateAudio = async (url) => {
	const res = await fetch('/api/proxy', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			url: url,
			fileName: 'audio.mp3',
		}),
	})

	const blob = await res.blob()
	const file = new File([blob], 'audio.mp3', { type: blob.type })
	return file
}

// chỉ convert URL dạng: /{small|medium|large}/images/...

const VALID_PREFIX_REGEX = /(small|medium|large)\/images\//
const WEBP_REGEX = /\.webp(\?.*)?$/i

export const convertImageUrl = (url?: any, sizeType?: TYPE_SIZE_IMAGE) => {
	if (!url) return url
	if (!VALID_PREFIX_REGEX.test(url)) return url

	const target = sizeType ?? TYPE_SIZE_IMAGE.medium

	let converted = url.replace(/(small|medium|large)\//, `${target}/`)

	if (target === TYPE_SIZE_IMAGE.origin) {
		converted = converted
			.replace(/(small|medium|large)\//, 'images/')
			.replace(WEBP_REGEX, '.jpg$1')
	}

	return converted
}
