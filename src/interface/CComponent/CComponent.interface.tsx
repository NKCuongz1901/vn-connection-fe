import { InputProps, ModalProps } from 'antd'

interface CInputOthersProps {
	label?: string
	error?: string
	isRequired?: boolean
	[key: string]: any
}

export interface CInputProps extends CInputOthersProps, InputProps {}

interface CModalOthersProps {
	titleLabel?: string
	[key: string]: any
}

export interface CModalProps extends CModalOthersProps, ModalProps {}
