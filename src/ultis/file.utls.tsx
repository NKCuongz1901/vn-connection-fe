import { handleUploadImage } from '@/apis/uploadApis'

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
