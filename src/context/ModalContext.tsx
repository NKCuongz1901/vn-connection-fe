'use client'
import CModalConfirm from '@/Components/Custom/CModal/CModalConfirm'
import CModalError from '@/Components/Custom/CModal/CModalError'
import CModalSuccess from '@/Components/Custom/CModal/CModalSuccess'
import AccountSuspendedModal from '@/Components/Modal/AccountSuspendedModal'
import { usePathname } from 'next/navigation'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'

import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import {
	isAccountSuspendedError,
	parseAccountSuspendedPayload,
} from '@/ultis/string'
import { handleRemoveAllCookie, isLogin } from '@/ultis/storage'

interface openSuccessProps {
	message: string
	titleLabel?: string
	onAccept?: any
	[key: string]: any
}
interface openConfirmProps {
	message: string
	titleLabel?: string
	confirmLabel?: string
	cancelLabel?: string
	ctype?: string
	onAccept?: any
	[key: string]: any
}
const ModalContext = createContext({
	openError: (_error: any) => {},
	openSuccess: (_success: openSuccessProps) => {},
	openConfirm: (_confrim: openConfirmProps) => {},
	closeModal: () => {},
})
export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
	const [open, setOpen] = useState({ type: '' }) as any
	const { onChangeRoute } = useLocalePath()

	const openError = useCallback((error: any) => {
		if (isAccountSuspendedError(error)) {
			setOpen({
				type: 'accountSuspended',
				payload: parseAccountSuspendedPayload(error),
			})
			return
		}
		setOpen({ type: 'error', error: error })
	}, [])
	const openSuccess = useCallback((data: openSuccessProps) => {
		setOpen({ type: 'success', ...data })
	}, [])
	const openConfirm = useCallback((data: openConfirmProps) => {
		setOpen({ type: 'confirm', ...data })
	}, [])
	const closeModal = useCallback(() => {
		setOpen('')
	}, [])

	const handleCloseAccountSuspended = useCallback(() => {
		closeModal()
		if (isLogin()) {
			handleRemoveAllCookie()
			onChangeRoute(mainRoutes.login)
		}
	}, [closeModal, onChangeRoute])
	const pathname = usePathname()
	useEffect(() => {
		closeModal()
	}, [pathname, closeModal])
	const _renderContent = () => {
		const { type, onAccept } = open || {}
		let content = <></>
		switch (type) {
			case 'error':
				content = <CModalError onCancel={closeModal} {...open} />
				break
			case 'success':
				content = (
					<CModalSuccess
						onCancel={(e) => {
							e.stopPropagation()
							closeModal()
							onAccept?.()
						}}
						{...open}
					/>
				)
				break
			case 'confirm':
				content = (
					<CModalConfirm
						onCancel={(e) => {
							e.stopPropagation()
							closeModal()
						}}
						onOk={(e) => {
							e.stopPropagation()
							onAccept?.()
						}}
						{...open}
					/>
				)
				break
			case 'accountSuspended':
				content = (
					<AccountSuspendedModal
						open
						payload={open.payload || {}}
						onClose={handleCloseAccountSuspended}
						onAppeal={handleCloseAccountSuspended}
					/>
				)
				break
			default:
				break
		}
		return content
	}
	return (
		<ModalContext.Provider
			value={{
				closeModal,
				openError,
				openSuccess,
				openConfirm,
			}}
		>
			{children}
			{_renderContent()}
		</ModalContext.Provider>
	)
}

export const useModal = () => useContext(ModalContext)
