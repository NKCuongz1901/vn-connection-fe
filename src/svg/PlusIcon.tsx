import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const PlusIcon = ({ fill }: SvgProps) => {
	const _fill = fill || '#7987A4'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
		>
			<path
				d="M4 8H12"
				stroke="white"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M8 12V4"
				stroke="white"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	)
}

export default memo(PlusIcon)
