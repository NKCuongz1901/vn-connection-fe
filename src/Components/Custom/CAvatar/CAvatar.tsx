import { Avatar, AvatarProps } from 'antd'
import { memo, useMemo } from 'react'

import { convertImageUrl } from '@/ultis/file'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'

const CAvatar = (_props: AvatarProps & { sizeType?: TYPE_SIZE_IMAGE }) => {
	const { src, sizeType, ...props } = _props
	const imgSrc = useMemo(
		() => convertImageUrl(src, sizeType || TYPE_SIZE_IMAGE.small),
		[src, sizeType],
	)

	return <Avatar src={imgSrc || '/images/defaultAvatar.png'} {...props} />
}

export default memo(CAvatar)
