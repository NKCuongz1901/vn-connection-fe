import { Flex, Input } from 'antd'

import { CInputProps } from '@/interface/CComponent/Input.interface'

import classes from './Input.module.scss'

const CInput = (_props: CInputProps) => {
	const { label, isRequired, style, ...props } = _props
	return (
		<Flex vertical gap={4}>
			{label && (
				<span>
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}
			<Input
				allowClear
				className={classes.wrapper}
				style={{
					borderRadius: 16,
					background: '#f4f8fc',
					height: 44,
					...style,
				}}
				{...props}
			/>
		</Flex>
	)
}

export default CInput
