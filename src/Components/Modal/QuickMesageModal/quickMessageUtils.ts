import { QuickMessageItem } from '@/hooks/QuickMesage/useQuickMessage'

export const formatShortcutLabel = (shortcut?: string) => {
	if (!shortcut) return '/'
	return shortcut.startsWith('/') ? shortcut : `/${shortcut}`
}

export const normalizeShortcut = (shortcut?: string) => {
	return (shortcut || '').replace(/^\//, '').trim()
}

export const getQuickMessageMediaUrl = (item?: QuickMessageItem | null) => {
	if (!item) return ''
	return item.media || item.medias?.[0]?.url || ''
}
