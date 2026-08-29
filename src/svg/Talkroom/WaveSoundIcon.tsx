import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const WaveSoundIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#006B35'
	const _width = width || '13'
	const _height = height || '13'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={_width}
			height={_height}
			viewBox="0 0 13 13"
			fill="none"
		>
			<path
				d="M0.5 9.33333C0.226667 9.33333 0 9.10667 0 8.83333V3.83333C0 3.56 0.226667 3.33333 0.5 3.33333C0.773333 3.33333 1 3.56 1 3.83333V8.83333C1 9.10667 0.773333 9.33333 0.5 9.33333Z"
				fill="white"
			/>
			<path
				d="M3.5 11C3.22667 11 3 10.7733 3 10.5V2.16667C3 1.89333 3.22667 1.66667 3.5 1.66667C3.77333 1.66667 4 1.89333 4 2.16667V10.5C4 10.7733 3.77333 11 3.5 11Z"
				fill="white"
			/>
			<path
				d="M6.5 12.6667C6.22667 12.6667 6 12.44 6 12.1667V0.5C6 0.226667 6.22667 0 6.5 0C6.77333 0 7 0.226667 7 0.5V12.1667C7 12.44 6.77333 12.6667 6.5 12.6667Z"
				fill="white"
			/>
			<path
				d="M9.5 11C9.22667 11 9 10.7733 9 10.5V2.16667C9 1.89333 9.22667 1.66667 9.5 1.66667C9.77333 1.66667 10 1.89333 10 2.16667V10.5C10 10.7733 9.77333 11 9.5 11Z"
				fill="white"
			/>
			<path
				d="M12.5 9.33333C12.2267 9.33333 12 9.10667 12 8.83333V3.83333C12 3.56 12.2267 3.33333 12.5 3.33333C12.7733 3.33333 13 3.56 13 3.83333V8.83333C13 9.10667 12.7733 9.33333 12.5 9.33333Z"
				fill="white"
			/>
		</svg>
	)
}

export default memo(WaveSoundIcon)
