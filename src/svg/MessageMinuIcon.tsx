import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const MessageMinuIcon = ({ fill }: SvgProps) => {
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
				d="M10.6673 1.33203H5.33398C2.66732 1.33203 1.33398 2.66536 1.33398 5.33203V13.9987C1.33398 14.3654 1.63398 14.6654 2.00065 14.6654H10.6673C13.334 14.6654 14.6673 13.332 14.6673 10.6654V5.33203C14.6673 2.66536 13.334 1.33203 10.6673 1.33203ZM10.334 8.4987H5.66732C5.39398 8.4987 5.16732 8.27203 5.16732 7.9987C5.16732 7.72536 5.39398 7.4987 5.66732 7.4987H10.334C10.6073 7.4987 10.834 7.72536 10.834 7.9987C10.834 8.27203 10.6073 8.4987 10.334 8.4987Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(MessageMinuIcon)
