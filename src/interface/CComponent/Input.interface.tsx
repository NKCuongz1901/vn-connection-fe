import { InputProps } from 'antd'

interface CInputOthersProps {
	label?: string
	isRequired?: boolean
	[key: string]: any
}

export interface CInputProps extends CInputOthersProps, InputProps {}
