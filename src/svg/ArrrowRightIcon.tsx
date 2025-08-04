import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const ArrrowRightIcon = ({ fill }: SvgProps) => {
	const _fill = fill || '#94A3B8'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M5.4687 2.248C5.72905 1.98765 6.15116 1.98765 6.41151 2.248L10.7582 6.59466C11.5319 7.36835 11.5319 8.63046 10.7582 9.40414L6.41151 13.7508C6.15116 14.0112 5.72905 14.0112 5.4687 13.7508C5.20835 13.4905 5.20835 13.0683 5.4687 12.808L9.81537 8.46133C10.0684 8.20835 10.0684 7.79046 9.81537 7.53747L5.4687 3.19081C5.20835 2.93046 5.20835 2.50835 5.4687 2.248Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(ArrrowRightIcon)
