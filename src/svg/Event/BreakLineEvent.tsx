import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const BreakLineEvent = ({ fill }: SvgProps) => {
	const _fill = fill || '#CBD5E1'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="78"
			viewBox="0 0 16 78"
			fill="none"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M15.9381 78C15.446 74.0537 12.0796 71 8 71C3.92038 71 0.553992 74.0537 0.0618938 78H0L0 0C0 4.41828 3.58172 8 8 8C12.4183 8 16 4.41828 16 0L16 78H15.9381Z"
				fill="white"
			/>
			<path d="M8 63L8 15" stroke={_fill} stroke-dasharray="4 4" />
		</svg>
	)
}

export default memo(BreakLineEvent)
