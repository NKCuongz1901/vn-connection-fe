import { Flex, Image, ImageProps } from 'antd'
import { memo, useEffect, useRef, useState } from 'react'

import classes from './CImage.module.scss'

const MAX_RETRY = 4
const RETRY_DELAY = 2000

const CImage = (_props: ImageProps) => {
	const { src, ...props } = _props

	const retryTimeoutRef = useRef<number | null>(null)

	const [retry, setRetry] = useState(0)
	const [imgSrc, setImgSrc] = useState(src)

	useEffect(() => {
		// clear timeout cũ khi src đổi
		if (retryTimeoutRef.current) {
			clearTimeout(retryTimeoutRef.current)
			retryTimeoutRef.current = null
		}

		setRetry(0)
		setImgSrc(src)

		// clear khi unmount
		return () => {
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current)
			}
		}
	}, [src])

	const handleError = () => {
		if (retry < MAX_RETRY && src) {
			retryTimeoutRef.current = window.setTimeout(() => {
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
