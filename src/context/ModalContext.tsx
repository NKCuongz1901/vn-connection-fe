'use client'
import CModalError from '@/Components/Custom/CModal/CModalError'
import { usePathname } from 'next/navigation'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'

const ModalContext = createContext({
	openModal: ({}) => {},
	openError: (_error: any) => {},
	closeModal: () => {},
})
export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
	const [open, setOpen] = useState() as any

	const openModal = useCallback(({ type = 'confirm', ...others }) => {
		setOpen({ type, ...others })
	}, [])
	const openError = useCallback((error: any) => {
		setOpen({ type: 'error', error: error })
	}, [])
	const closeModal = useCallback(() => {
		setOpen('')
	}, [])
	const pathname = usePathname()

	useEffect(() => {
		closeModal()
	}, [pathname, closeModal])
	return (
		<ModalContext.Provider
			value={{
				openModal,
				closeModal,
				openError,
			}}
		>
			{children}
			{open?.type === 'error' && (
				<CModalError onCancel={closeModal} {...open} />
			)}
		</ModalContext.Provider>
	)
}

export const useModal = () => useContext(ModalContext)
