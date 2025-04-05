import { DatePickerProps, InputProps, ModalProps, SelectProps } from 'antd'
import { TextAreaProps } from 'antd/es/input'

interface CInputOthersProps {
	label?: string
	error?: string
	isRequired?: boolean
	[key: string]: any
}

export interface CInputProps extends CInputOthersProps, InputProps {}
export interface CTextAreaProps extends CInputOthersProps, TextAreaProps {}
interface CModalOthersProps {
	titleLabel?: string
	[key: string]: any
}

export interface CModalProps extends CModalOthersProps, ModalProps {}

interface CDatePickerOthersProps {
	label?: string
	error?: string
	isRequired?: boolean
	[key: string]: any
}

export interface CDatePickerProps
	extends CDatePickerOthersProps,
		DatePickerProps {}

interface CSelectOthersProps {
	label?: string
	error?: string
	isRequired?: boolean
	[key: string]: any
}

export interface CSelectProps extends CSelectOthersProps, SelectProps {}
