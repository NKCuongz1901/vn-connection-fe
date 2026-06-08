import { QuickMessageItem } from '@/hooks/QuickMesage/useQuickMessage'

/** Only allow Latin characters */
export const SHORTCUT_REGEX = /^[a-zA-Z]+$/

/** Filter when user is typing */
export const sanitizeShortcutInput = (value: string) =>
	(value || '').replace(/^\//, '').replace(/[^a-zA-Z]/g, '')

export const formatShortcutLabel = (shortcut?: string) => {
	if (!shortcut) return '/'
	const normalized = normalizeShortcut(shortcut)
	return normalized ? `/${normalized}` : '/'
}

export const normalizeShortcut = (shortcut?: string) => {
	return sanitizeShortcutInput(shortcut || '')
}

export const isValidShortcut = (shortcut?: string) => {
	const normalized = normalizeShortcut(shortcut)
	return SHORTCUT_REGEX.test(normalized)
}

export const getQuickMessageMediaUrl = (item?: QuickMessageItem | null) => {
	if (!item) return ''
	return item.media || item.medias?.[0]?.url || ''
}

export const mapQuickMessageToSendMedias = (item?: QuickMessageItem | null) => {
	if (!item) return []
	if (item.medias?.length) {
		return item.medias.map((media) => ({
			url: media.url,
			type: media.type || 'IMAGE',
			width: media.width,
			height: media.height,
			ratio: media.ratio,
			duration: media.duration,
			thumbnail: media.url,
		}))
	}
	if (item.media) {
		return [{ url: item.media, type: 'IMAGE', thumbnail: item.media }]
	}
	return []
}
