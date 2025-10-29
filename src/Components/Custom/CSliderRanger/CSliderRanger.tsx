import { Slider } from 'antd'
import { memo } from 'react'

import { CSliderRangerProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CSliderRanger.module.scss'
import ArrowRightIcon from '@/svg/ArrowRightIcon'

const CSliderRanger = (_props: CSliderRangerProps) => {
	const { showIcon, icon, ...props } = _props
	return (
		<div className={classes.wrapper}>
			{!!showIcon && (
				<div className={classes.icon}>{icon || <ArrowRightIcon />}</div>
			)}
			<Slider {...props} />
		</div>
	)
}

export default memo(CSliderRanger)
