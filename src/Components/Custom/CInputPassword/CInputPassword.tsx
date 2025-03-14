import { Input, InputProps } from 'antd'

import classes from './CInputPassword.module.scss'

const CInputPassword = (_props: InputProps & { [key: string]: any }) => {
	const { style, ...props } = _props
	return (
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
	)
}

export default CInputPassword
