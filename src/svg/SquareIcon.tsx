import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const SquareIcon = ({ fill }: SvgProps) => {
	const _fill = fill || '#fff'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
		>
			<path
				d="M12.45 19.5H7.05C2.11 19.5 0 17.39 0 12.45V7.05C0 2.11 2.11 0 7.05 0H12.45C17.39 0 19.5 2.11 19.5 7.05V12.45C19.5 17.39 17.39 19.5 12.45 19.5Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(SquareIcon)
