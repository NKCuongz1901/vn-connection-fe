import { Input, InputProps } from 'antd'
import React from 'react'

import classes from './Input.module.scss'
const CInput = (props: InputProps) => {
	const { style, ...Oprops } = props
	return (
		<Input
			className={classes.wrapper}
			style={{ borderRadius: 16, background: '#f4f8fc', ...style }}
			{...Oprops}
		/>
	)
}

export default CInput
