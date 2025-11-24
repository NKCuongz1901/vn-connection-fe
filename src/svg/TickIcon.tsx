import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const TickIcon = ({ fill }: SvgProps) => {
	const _fill = fill || '#E55A0F'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="13"
			height="11"
			viewBox="0 0 13 11"
			fill="none"
		>
			<path
				d="M5.91177 10.0117C5.31965 10.6628 4.35889 10.6628 3.76705 10.0117L0.44409 6.35826C-0.14803 5.70755 -0.14803 4.65122 0.44409 4.00052C1.03593 3.34951 1.99669 3.34951 2.58881 4.00052L4.56864 6.17696C4.7181 6.34098 4.96072 6.34098 5.11047 6.17696L10.7888 1.08933C11.6405 0.465038 12.3272 -0.34067 12.7762 0.152893C13.0601 0.465031 12.2088 1.71317 11.9244 2.02579L5.91177 10.0117Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(TickIcon)
