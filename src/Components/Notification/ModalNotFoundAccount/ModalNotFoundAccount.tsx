import CModal from '@/Components/Custom/CModal/CModal'
import React from 'react'
import classes from './ModalNotFoundAccount.module.scss'
import CButton from '@/Components/Custom/CButton/CButton'

type ModalNotFoundAccountProps = {
	open: boolean
	icon: React.ReactNode
	title: string
	description: string
	leftText?: string
	rightText?: string
	onClose?: () => void
	onGetHelp?: () => void
	onRegister?: () => void
}

function ModalNotFoundAccount(_props: ModalNotFoundAccountProps) {
	const {
		open,
		icon,
		title,
		description,
		rightText = 'Register',
		leftText = 'Get help',
		onClose,
		onGetHelp,
		onRegister,
	} = _props
	return (
		<CModal
			open={open}
			onClose={onClose}
			onCancel={onClose}
			footer={[
				<div key="footer" className={classes.footer}>
					<CButton
						ctype="default"
						style={{ width: '100%', borderRadius: '99px' }}
						onClick={onGetHelp}
					>
						{leftText}
					</CButton>
					<CButton
						ctype="oranger"
						style={{ width: '100%', borderRadius: '99px' }}
						onClick={onRegister}
					>
						{rightText}
					</CButton>
				</div>,
			]}
		>
			<div className={classes.modalNotFoundAccountWrapper}>
				{icon}
				<p className={classes.title}>{title}</p>
				<p className={classes.description}>
					Please register{' '}
					<span className={classes.phone}>&apos;{description}&apos;</span> if
					you&apos;re new here, or contact Support for help.
				</p>
			</div>
		</CModal>
	)
}

export default ModalNotFoundAccount
