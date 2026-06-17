import { handleUploadImage, handleUploadVideo } from '@/apis/uploadApis'

export const isImageOnlyMediaMessage = (item?: {
	type?: string
	medias?: { type?: string }[]
}) => {
	if (item?.type !== 'MEDIAS') return false
	const medias = item.medias || []
	if (!medias.length) return false
	return medias.every((media) => media?.type === 'IMAGE')
}

const getMediaThumbnail = (item: { thumbnail?: string; url?: string }) => {
	if (typeof item?.thumbnail === 'string' && item.thumbnail) {
		return item.thumbnail
	}
	return item?.url || ''
}

export const buildChatMediasPayload = async (_medias: any[] = []) => {
	const medias: any[] = []

	for (const item of _medias) {
		if (item?.file) {
			const url =
				item.type === 'IMAGE'
					? await handleUploadImage(item.file)
					: await handleUploadVideo(item.file)
			medias.push({
				url,
				type: item?.type || 'IMAGE',
				fileName: null,
				width: 692,
				height: 1500,
				ratio: 0.4613333333333333,
				thumbnail: getMediaThumbnail({ url }),
				duration: 0,
			})
		} else if (item?.url) {
			medias.push({
				url: item.url,
				type: item?.type || 'IMAGE',
				fileName: item.fileName ?? null,
				width: item.width ?? 692,
				height: item.height ?? 1500,
				ratio: item.ratio ?? 0.4613333333333333,
				thumbnail: getMediaThumbnail(item),
				duration: item.duration ?? 0,
			})
		}
	}

	return medias
}
