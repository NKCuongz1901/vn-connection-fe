import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const VolumeMuteIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#FFFFFF'
	const _width = width || '20'
	const _height = height || '20'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={_width}
			height={_height}
			viewBox="0 0 20 20"
			fill="none"
		>
			<path
				d="M10.8333 3.33334C10.3667 3.07501 9.80833 3.12501 9.31667 3.47501L6.80833 5.20834C6.64167 5.32501 6.45 5.38334 6.25 5.38334H4.58333C3.43333 5.38334 2.5 6.31668 2.5 7.46668V12.5333C2.5 13.6833 3.43333 14.6167 4.58333 14.6167H6.25C6.45 14.6167 6.64167 14.675 6.80833 14.7917L9.31667 16.525C9.65 16.7583 10.025 16.875 10.4 16.875C10.55 16.875 10.7 16.85 10.8333 16.8C11.525 16.525 12 15.85 12 15.0833V4.91668C12 4.15001 11.525 3.47501 10.8333 3.20001V3.33334Z"
				fill={_fill}
			/>
			<path
				d="M13.3333 8.33334L17.5 12.5M17.5 8.33334L13.3333 12.5"
				stroke={_fill}
				strokeWidth="1.25"
				strokeLinecap="round"
			/>
		</svg>
	)
}

export default memo(VolumeMuteIcon)
