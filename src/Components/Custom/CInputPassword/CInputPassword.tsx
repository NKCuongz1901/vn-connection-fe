'use client'

import { Flex, Input } from 'antd'

import { CInputProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CInputPassword.module.scss'

const CInputPassword = (_props: CInputProps) => {
	const { error, style, label, isRequired, ...props } = _props
	return (
		<Flex vertical gap={4}>
			{label && (
				<span>
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}
			<Input.Password
				className={classes.wrapper}
				placeholder="Password"
				allowClear
				autoComplete="new-password"
				style={{
					background: '#f4f8fc',
					borderRadius: 16,
					padding: '12px 16px',
					height: 44,
					...style,
				}}
				{...props}
			/>
			{error && <span className="error">{error}</span>}
		</Flex>
	)
}

export default CInputPassword
