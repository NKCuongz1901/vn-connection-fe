import { Avatar, AvatarProps } from 'antd'
import React, { memo } from 'react'

const CAvatar = (_props: AvatarProps) => {
	const { src, ...props } = _props
	return <Avatar src={src || '/images/defaultAvatar.png'} {...props} />
}

export default memo(CAvatar)
