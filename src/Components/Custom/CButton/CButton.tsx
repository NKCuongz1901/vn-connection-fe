import { Button, ButtonProps } from 'antd'

const CButton = (_props: ButtonProps) => {
	const { children, style, ...props } = _props
	return (
		<Button
			style={{
				borderRadius: 100,
				height: 48,
				fontWeight: 600,
				padding: '12px 16px',
				border: 'none',
				...style,
			}}
			{...props}
		>
			{children}
		</Button>
	)
}

export default CButton
