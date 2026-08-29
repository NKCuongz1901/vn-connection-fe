import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const UserMicOnIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#FFFFFF'
	const _width = width || '16'
	const _height = height || '16'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={_width}
			height={_height}
			viewBox="0 0 16 16"
			fill="none"
		>
			<path
				d="M8 1.33334C6.52724 1.33334 5.33333 2.52725 5.33333 4.00001V7.69334C5.33333 9.1661 6.52724 10.36 8 10.36C9.47276 10.36 10.6667 9.1661 10.6667 7.69334V4.00001C10.6667 2.52725 9.47276 1.33334 8 1.33334Z"
				fill={_fill}
			/>
			<path
				d="M12.7733 7.48C12.58 7.48 12.42 7.64 12.42 7.83333V7.84667C12.42 10.1933 10.5 12.1133 8.15333 12.1133C5.80667 12.1133 3.88667 10.1933 3.88667 7.84667V7.83333C3.88667 7.64 3.72667 7.48 3.53333 7.48C3.34 7.48 3.18 7.64 3.18 7.83333V7.84667C3.18 10.48 5.07333 12.62 7.58 12.9533V14.2C7.58 14.3933 7.74 14.5533 7.93333 14.5533C8.12667 14.5533 8.28667 14.3933 8.28667 14.2V12.9533C10.7933 12.62 12.6867 10.48 12.6867 7.84667V7.83333C12.6867 7.64 12.5267 7.48 12.3333 7.48H12.7733Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(UserMicOnIcon)
