'use client'
import CModalConfirm from '@/Components/Custom/CModal/CModalConfirm'
import CModalError from '@/Components/Custom/CModal/CModalError'
import CModalSuccess from '@/Components/Custom/CModal/CModalSuccess'
import { usePathname } from 'next/navigation'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'

interface openSuccessProps {
	message: string
	titleLabel?: string
	onAccept?: any
	[key: string]: any
}
interface openConfirmProps {
	message: string
	titleLabel?: string
	onClose?: any
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

	const openError = useCallback((error: any) => {
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
						onCancel={() => {
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
						onCancel={() => {
							closeModal()
						}}
						onOk={() => {
							onAccept?.()
						}}
						{...open}
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
