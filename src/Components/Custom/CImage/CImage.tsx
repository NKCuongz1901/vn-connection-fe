import { Flex, Image, ImageProps } from 'antd'
import { memo } from 'react'

import classes from './CImage.module.scss'
const CImage = (_props: ImageProps) => {
	const { src, ...props } = _props
	return (
		<Flex align="center" justify="center" className={classes.wrapper}>
			<Image
				className={classes.image}
				src={src || '/images/defaultCover.png'}
				{...props}
			/>
		</Flex>
	)
}

export default memo(CImage)
