import { Slider } from 'antd'
import { memo } from 'react'

import { CSliderRangerProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CSliderRanger.module.scss'

const CSliderRanger = (_props: CSliderRangerProps) => {
	const { ...props } = _props
	return (
		<div className={classes.wrapper}>
			<Slider {...props} />
		</div>
	)
}

export default memo(CSliderRanger)
