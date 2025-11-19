import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const ClockIconDivideTopIcon = ({ fill }: SvgProps) => {
	const _fill = fill || '#006B35'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="20"
			viewBox="0 0 18 20"
			fill="none"
		>
			<path
				d="M8.67 2.65C3.89 2.65 0 6.54 0 11.32C0 16.1 3.89 20 8.67 20C13.45 20 17.34 16.11 17.34 11.33C17.34 6.55 13.45 2.65 8.67 2.65ZM9.42 11C9.42 11.41 9.08 11.75 8.67 11.75C8.26 11.75 7.92 11.41 7.92 11V6C7.92 5.59 8.26 5.25 8.67 5.25C9.08 5.25 9.42 5.59 9.42 6V11Z"
				fill={_fill}
			/>
			<path
				d="M11.56 1.45H5.78C5.38 1.45 5.06 1.13 5.06 0.73C5.06 0.33 5.38 0 5.78 0H11.56C11.96 0 12.28 0.32 12.28 0.72C12.28 1.12 11.96 1.45 11.56 1.45Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(ClockIconDivideTopIcon)
