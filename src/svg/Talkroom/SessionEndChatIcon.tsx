import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const SessionEndChatIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#006B35'
	const _width = width || '40'
	const _height = height || '32'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={_width}
			height={_height}
			viewBox="0 0 40 32"
			fill="none"
		>
			<path
				d="M12 0H4C1.79086 0 0 1.79086 0 4V18C0 20.2091 1.79086 22 4 22H6.58579C6.851 22 7.10536 22.1054 7.29289 22.2929L11.2929 26.2929C11.9229 26.9229 13 26.4767 13 25.5858V22H20C22.2091 22 24 20.2091 24 18V4C24 1.79086 22.2091 0 20 0H12Z"
				fill={_fill}
			/>
			<path
				d="M36 6H28C25.7909 6 24 7.79086 24 10V20C24 22.2091 25.7909 24 28 24H30.5858C30.851 24 31.1054 24.1054 31.2929 24.2929L35.2929 28.2929C35.9229 28.9229 37 28.4767 37 27.5858V24H36C38.2091 24 40 22.2091 40 20V10C40 7.79086 38.2091 6 36 6Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(SessionEndChatIcon)
