import { AvatarProps, Flex } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import HostIcon from '@/svg/HostIcon'
import CAvatar from '../CAvatar'

import classes from './CAvatarBandage.module.scss'

interface CAvatarBandageProps {
	customeBandage?: any
	classBandage?: any
}
const CAvatarBandage = (_props: CAvatarBandageProps & AvatarProps) => {
	const { customeBandage, classBandage, ...props } = _props
	const _renderBandage = () => {
		return (
			<Flex
				className={clsx(
					classes.bandage,
					{
						[classes.custom]: !!customeBandage,
					},
					classBandage,
				)}
			>
				{customeBandage || <HostIcon />}
			</Flex>
		)
	}

	return (
		<div className={classes.wrapper}>
			<CAvatar {...props} />
			{_renderBandage()}
		</div>
	)
}

export default memo(CAvatarBandage)
