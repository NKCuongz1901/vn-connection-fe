import { Input, InputProps } from 'antd'
import React from 'react'

import classes from './Input.module.scss'
const CInput = (_props: InputProps) => {
	const { style, ...props } = _props
	return (
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
	)
}

export default CInput
