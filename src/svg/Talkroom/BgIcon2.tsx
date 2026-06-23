import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const BgIcon2 = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#94A3B8'
	const _width = width || '14'
	const _height = height || '14'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="68"
			height="68"
			viewBox="0 0 68 68"
			fill="none"
		>
			<rect
				x="41.3008"
				y="73.3398"
				width="31.5261"
				height="70.9115"
				rx="15.7631"
				transform="rotate(-153.852 41.3008 73.3398)"
				fill="#E7F5E9"
			/>
			<rect
				width="31.5261"
				height="70.9347"
				rx="15.7631"
				transform="matrix(0.897657 -0.440694 -0.440694 -0.897657 26.6406 73.3398)"
				fill="#E7F5E9"
			/>
			<rect
				x="0.00390625"
				y="33.3398"
				width="32"
				height="68"
				rx="16"
				transform="rotate(-90 0.00390625 33.3398)"
				fill="#E7F5E9"
			/>
		</svg>
	)
}

export default memo(BgIcon2)
