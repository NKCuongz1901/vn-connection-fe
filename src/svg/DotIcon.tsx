import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const DotIcon = ({ fill }: SvgProps) => {
	const _fill = fill || '#94A3B8'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="3"
			height="3"
			viewBox="0 0 3 3"
			fill="none"
		>
			<circle cx="1.5" cy="1.5" r="1.5" fill={_fill} />
		</svg>
	)
}

export default memo(DotIcon)
