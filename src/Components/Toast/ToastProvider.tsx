'use client'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './ToastProvider.scss'

export default function ToastProvider({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			{children}
			<ToastContainer
				position="bottom-right"
				autoClose={5000}
				hideProgressBar
				newestOnTop
				closeOnClick={false}
				pauseOnHover
				draggable={false}
				theme="light"
			/>
		</>
	)
}
