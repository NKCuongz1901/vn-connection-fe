import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const BgIcon1 = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#94A3B8'
	const _width = width || '14'
	const _height = height || '14'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="82"
			height="82"
			viewBox="0 0 82 82"
			fill="none"
		>
			<rect
				width="36"
				height="81.1957"
				rx="18"
				transform="matrix(-1 -8.74228e-08 -8.74228e-08 1 58.5977 0)"
				fill="#E7F5E9"
			/>
			<rect
				width="36"
				height="81.1957"
				rx="18"
				transform="matrix(-4.37114e-08 1 1 4.37114e-08 0 22.5972)"
				fill="#E7F5E9"
			/>
		</svg>
	)
}

export default memo(BgIcon1)
