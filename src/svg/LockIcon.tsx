import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const LockIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#FFF'
	const _width = width || '10'
	const _height = height || '10'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
		>
			<path
				d="M10 5.75C8.11 5.75 7.75 6.54 7.75 8V8.62H12.25V8C12.25 6.54 11.89 5.75 10 5.75Z"
				fill="#7987A4"
			/>
			<path
				d="M9.9999 13.1C10.6074 13.1 11.0999 12.6075 11.0999 12C11.0999 11.3925 10.6074 10.9 9.9999 10.9C9.39239 10.9 8.8999 11.3925 8.8999 12C8.8999 12.6075 9.39239 13.1 9.9999 13.1Z"
				fill="#7987A4"
			/>
			<path
				d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM15.38 12.5C15.38 14.7 14.7 15.38 12.5 15.38H7.5C5.3 15.38 4.62 14.7 4.62 12.5V11.5C4.62 9.79 5.03 9 6.25 8.73V8C6.25 7.07 6.25 4.25 10 4.25C13.75 4.25 13.75 7.07 13.75 8V8.73C14.97 9 15.38 9.79 15.38 11.5V12.5Z"
				fill="#7987A4"
			/>
		</svg>
	)
}

export default memo(LockIcon)
