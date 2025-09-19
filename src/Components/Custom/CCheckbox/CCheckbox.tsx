import { Checkbox } from 'antd'
import { memo } from 'react'

import { CCheckboxProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CCheckbox.module.scss'

const CCheckbox = (_props: CCheckboxProps) => {
	const { ...props } = _props
	return (
		<div className={classes.wrapper}>
			<Checkbox {...props} />
		</div>
	)
}

export default memo(CCheckbox)
