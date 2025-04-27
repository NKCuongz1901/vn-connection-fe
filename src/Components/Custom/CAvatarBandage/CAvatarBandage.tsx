import { AvatarProps, Flex } from 'antd'
import { memo } from 'react'

import CAvatar from '../CAvatar'

import classes from './CAvatarBandage.module.scss'
import HostIcon from '@/svg/HostIcon'

interface CAvatarBandageProps {
	customeBandage?: any
}
const CAvatarBandage = (_props: CAvatarBandageProps & AvatarProps) => {
	const { customeBandage, ...props } = _props
	const _renderBandage = () => {
		return (
			<Flex className={classes.bandage}>{customeBandage || <HostIcon />}</Flex>
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
