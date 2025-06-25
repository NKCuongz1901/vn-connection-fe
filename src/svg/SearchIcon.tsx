import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const SearchIcon = ({ fill }: SvgProps) => {
	const _fill = fill || '#48546B'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
		>
			<path
				d="M9.58268 17.4993C13.9549 17.4993 17.4993 13.9549 17.4993 9.58268C17.4993 5.21043 13.9549 1.66602 9.58268 1.66602C5.21043 1.66602 1.66602 5.21043 1.66602 9.58268C1.66602 13.9549 5.21043 17.4993 9.58268 17.4993Z"
				stroke={_fill}
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M18.3327 18.3327L16.666 16.666"
				stroke={_fill}
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	)
}

export default memo(SearchIcon)
