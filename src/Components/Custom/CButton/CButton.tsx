import { Button, ButtonProps } from 'antd'

const variant = {
	oranger: {
		color: 'white',
		background: ' #e55a0f ',
	},
	disabled: {
		color: 'black',
		background: ' #EEF3F6 ',
	},
}

type VariantType = keyof typeof variant | null | undefined

const CButton = (_props: ButtonProps & { ctype?: VariantType }) => {
	const { children, ctype, style, ...props } = _props
	return (
		<Button
			style={{
				borderRadius: 100,
				height: 48,
				fontWeight: 600,
				padding: '12px 16px',
				border: 'none',
				...(ctype ? variant[ctype] || {} : {}),
				...style,
			}}
			{...props}
		>
			{children}
		</Button>
	)
}

export default CButton
