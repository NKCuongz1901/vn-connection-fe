import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const CopyIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#48546B'
	const _width = width || '24'
	const _height = height || '24'
	return (
		<svg
			width={_width}
			height={_height}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z"
				fill={_fill}
			/>
			<path
				d="M17.1 2H12.9C9.81692 2 8.37098 3.09409 8.06974 5.73901C8.00672 6.29235 8.46499 6.75 9.0219 6.75H11.1C15.3 6.75 17.25 8.7 17.25 12.9V14.9781C17.25 15.535 17.7077 15.9933 18.261 15.9303C20.9059 15.629 22 14.1831 22 11.1V6.9C22 3.4 20.6 2 17.1 2Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(CopyIcon)
