import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const FlagIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#48546B'
	const _width = width || 13
	const _height = height || 20
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={_width}
			height={_height}
			viewBox="0 0 13 20"
			fill="none"
		>
			<path
				d="M9.5 5.16L1.5 1.7V0.75C1.5 0.34 1.16 0 0.75 0C0.34 0 0 0.34 0 0.75V19.25C0 19.66 0.34 20 0.75 20C1.16 20 1.5 19.66 1.5 19.25V15.29L9.72 11.23C9.72 11.23 9.72 11.23 9.73 11.23C11.39 10.37 12.28 9.26 12.23 8.09C12.18 6.92 11.21 5.88 9.5 5.16Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(FlagIcon)
