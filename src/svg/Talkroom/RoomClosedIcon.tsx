import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

/** Orange circle with X icon for room force-closed modal. */
const RoomClosedIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#E55A0F'
	const _width = width || 40
	const _height = height || 40

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={_width}
			height={_height}
			viewBox="0 0 40 40"
			fill="none"
		>
			<circle cx="20" cy="20" r="20" fill={_fill} />
			<path
				d="M26.5 13.5L13.5 26.5M13.5 13.5L26.5 26.5"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
		</svg>
	)
}

export default memo(RoomClosedIcon)
