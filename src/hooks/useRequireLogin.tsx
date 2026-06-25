import { useCallback } from 'react'

import { useModal } from '@/context/ModalContext'
import { useLocalePath } from '@/ultis/route'

import { mainRoutes } from '@/routes/MainRoutes'

export default function useRequireLogin() {
	const { openConfirm } = useModal()
	const { onChangeRoute } = useLocalePath()

	const requireLogin = useCallback(() => {
		openConfirm({
			titleLabel: 'Login required',
			message: 'Please sign in to access this page.',
			confirmLabel: 'Sign in',
			cancelLabel: 'Cancel',
			onAccept: () => onChangeRoute(mainRoutes.login),
		})
	}, [openConfirm, onChangeRoute])

	return { requireLogin }
}
