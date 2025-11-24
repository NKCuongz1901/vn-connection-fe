import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const ArrrowLeftIcon = ({ fill }: SvgProps) => {
	const _fill = fill || '#94A3B8'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M13.0891 2.81048C13.4146 3.13592 13.4146 3.66356 13.0891 3.989L7.65579 9.42233C7.33956 9.73856 7.33956 10.2609 7.65579 10.5772L13.0891 16.0105C13.4146 16.3359 13.4146 16.8636 13.0891 17.189C12.7637 17.5144 12.2361 17.5144 11.9106 17.189L6.47728 11.7557C5.51018 10.7886 5.51018 9.21092 6.47728 8.24382L11.9106 2.81048C12.2361 2.48505 12.7637 2.48505 13.0891 2.81048Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(ArrrowLeftIcon)
