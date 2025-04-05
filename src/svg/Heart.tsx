import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const Heart = ({ fill }: SvgProps) => {
	const _fill = fill || '#94A3B8'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
		>
			<path
				d="M16.44 4.1001C14.63 4.1001 13.01 4.9801 12 6.3301C10.99 4.9801 9.37 4.1001 7.56 4.1001C4.49 4.1001 2 6.6001 2 9.6901C2 10.8801 2.19 11.9801 2.52 13.0001C4.1 18.0001 8.97 20.9901 11.38 21.8101C11.72 21.9301 12.28 21.9301 12.62 21.8101C15.03 20.9901 19.9 18.0001 21.48 13.0001C21.81 11.9801 22 10.8801 22 9.6901C22 6.6001 19.51 4.1001 16.44 4.1001Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(Heart)
