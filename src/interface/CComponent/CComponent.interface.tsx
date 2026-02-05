import {
	CheckboxProps,
	DatePickerProps,
	InputProps,
	ModalProps,
	SelectProps,
} from 'antd'
import { TextAreaProps } from 'antd/es/input'
import { SliderRangeProps } from 'antd/es/slider'

interface CInputOthersProps {
	label?: string
	error?: string
	desc?: string
	subLabel?: string
	isRequired?: boolean
	isNotBold?: boolean
	isFullHeight?: boolean
	[key: string]: any
}

export interface CInputProps extends CInputOthersProps, InputProps {}
export interface CTextAreaProps extends CInputOthersProps, TextAreaProps {}
interface CModalOthersProps {
	titleLabel?: string
	confirmLabel?: string
	cancelLabel?: string
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
	extends CDatePickerOthersProps, DatePickerProps {}

interface CSelectOthersProps {
	isRequired?: boolean
	isWhite?: boolean
	isMaxRadius?: boolean
	isSimple?: boolean
	label?: any
	error?: string
	[key: string]: any
}

export interface CSelectProps extends CSelectOthersProps, SelectProps {}
interface ExtendProps {
	[key: string]: any
}
export interface CSliderRangerProps extends ExtendProps, SliderRangeProps {}
export interface CCheckboxProps extends ExtendProps, CheckboxProps {}
