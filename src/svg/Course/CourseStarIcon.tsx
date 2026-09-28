import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

/** 12×12 gold star used on CourseCard rating. */
const CourseStarIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#F5A524'
	const _width = width || 12
	const _height = height || 12

	return (
		<svg
			width={_width}
			height={_height}
			viewBox="0 0 12 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M6 1.25L7.236 4.01L10.25 4.29L7.98 6.24L8.694 9.2L6 7.61L3.306 9.2L4.02 6.24L1.75 4.29L4.764 4.01L6 1.25Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(CourseStarIcon)
