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
