import { ButtonProps } from 'antd'

import PlusIcon from '@/svg/PlusIcon'
import CButton from '../CButton/CButton'

import classes from './CButtonCreate.module.scss'

const CButtonCreate = (_props: ButtonProps & { isIcon?: boolean }) => {
	const { children, isIcon, ...props } = _props
	return (
		<div className={classes.wrapper}>
			<div className={classes.container}>
				<CButton ctype="oranger" {...props}>
					<>
						{isIcon && <PlusIcon />}
						{children}
					</>
				</CButton>
			</div>
		</div>
	)
}

export default CButtonCreate
