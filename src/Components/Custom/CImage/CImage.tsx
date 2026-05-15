import { Flex, Image, ImageProps } from 'antd'
import { memo, useEffect, useRef, useState } from 'react'

import classes from './CImage.module.scss'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'
import { convertImageUrl } from '@/ultis/file'

const MAX_RETRY = 4
const RETRY_DELAY = 2000
const DEFAULT_FALLBACK = '/images/defaultCover2.jpg'

type CImageProps = ImageProps & {
	sizeType?: TYPE_SIZE_IMAGE
}

const CImage = (_props: CImageProps) => {
	const { src, sizeType, ...props } = _props

	const retryTimeoutRef = useRef<number | null>(null)

	const [retry, setRetry] = useState(0)
	const [imgSrc, setImgSrc] = useState(() => convertImageUrl(src, sizeType))

	useEffect(() => {
		if (retryTimeoutRef.current) {
			clearTimeout(retryTimeoutRef.current)
			retryTimeoutRef.current = null
		}

		setRetry(0)
		setImgSrc(convertImageUrl(src, sizeType))

		return () => {
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current)
			}
		}
	}, [src, sizeType])

	const handleError = () => {
		// quá retry → fallback về URL GỐC
		if (retry >= MAX_RETRY) {
			setImgSrc(src)
			return
		}

		if (src) {
			retryTimeoutRef.current = window.setTimeout(() => {
				setRetry((r) => r + 1)

				const base = convertImageUrl(src, sizeType)
				const joiner = base?.includes('?') ? '&' : '?'

				setImgSrc(`${base}${joiner}retry=${Date.now()}`)
			}, RETRY_DELAY)
		}
	}

	return (
		<Flex align="center" justify="center" className={classes.wrapper}>
			<Image
				className={classes.image}
				src={imgSrc || DEFAULT_FALLBACK}
				preview={false}
				onError={handleError}
				{...props}
			/>
		</Flex>
	)
}

export default memo(CImage)
