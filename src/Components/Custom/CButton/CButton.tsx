'use client'

import { Button, ButtonProps } from 'antd'

import classes from './CButton.module.scss'
import clsx from 'clsx'
const variant = {
	default: {
		color: 'black',
		background: '#F1F5F8',
		fontSize: '16px',
	},
	oranger: {
		color: 'white',
		background: ' #e55a0f ',
		fontSize: '16px',
	},
	disabled: {
		color: 'black',
		background: '#EEF3F6',
	},
	disableHangout: {
		color: '#94A3B8',
		background: '#EEF3F6',
	},
	success: {
		color: '#EEF3F6',
		background: '#006B35',
	},
	error: {
		color: '#F80024',
		background: '#EEF3F6',
	},
	errorRevert: {
		color: '#EEF3F6',
		background: '#F80024',
	},
	danger: {
		color: '#EEF3F6',
		background: '#CD3031',
	},
}

type VariantType = keyof typeof variant | null | undefined | '' | false

const CButton = (_props: ButtonProps & { ctype?: VariantType }) => {
	const { children, ctype, style, ...props } = _props
	const { disabled } = _props
	return (
		<div
			className={clsx(classes.wrapper, { [classes.disabled]: disabled })}
			style={style}
		>
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
