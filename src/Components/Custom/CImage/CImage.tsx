import { Flex, Image, ImageProps } from 'antd'
import { memo, useEffect, useState } from 'react'

import classes from './CImage.module.scss'

const MAX_RETRY = 2
const RETRY_DELAY = 1000

const CImage = (_props: ImageProps) => {
	const { src, ...props } = _props
	const [retry, setRetry] = useState(0)
	const [imgSrc, setImgSrc] = useState(src)

	useEffect(() => {
		setRetry(0)
		setImgSrc(src)
	}, [src])

	const handleError = () => {
		if (retry < MAX_RETRY && src) {
			setTimeout(() => {
				setRetry((r) => r + 1)
				setImgSrc(`${src}?retry=${Date.now()}`)
			}, RETRY_DELAY)
		}
	}

	return (
		<Flex align="center" justify="center" className={classes.wrapper}>
			<Image
				className={classes.image}
				src={imgSrc || '/images/defaultCover.png'}
				preview={false}
				onError={handleError}
				{...props}
			/>
		</Flex>
	)
}

export default memo(CImage)
