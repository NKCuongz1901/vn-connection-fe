'use client'

import { Button, ButtonProps } from 'antd'

import classes from './CButton.module.scss'
const variant = {
	oranger: {
		color: 'white',
		background: ' #e55a0f ',
	},
	disabled: {
		color: 'black',
		background: '#EEF3F6',
	},
	success: {
		color: '#EEF3F6 ',
		background: '#006B35',
	},
	error: {
		color: '#F80024',
		background: '#EEF3F6 ',
	},
}

type VariantType = keyof typeof variant | null | undefined | '' | false

const CButton = (_props: ButtonProps & { ctype?: VariantType }) => {
	const { children, ctype, style, ...props } = _props
	const { disabled } = _props
	return (
		<div className={classes.wrapper} style={style}>
			<Button
				style={{
					...(!disabled && ctype ? variant[ctype] || {} : {}),
				}}
				{...props}
			>
				{children}
			</Button>
		</div>
	)
}

export default CButton
