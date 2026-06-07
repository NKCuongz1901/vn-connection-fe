import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const ReminderIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#94A3B8'
	const _width = width || '32'
	const _height = height || '32'
	return (
		<svg
			width={_width}
			height={_height}
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M15.9999 6.20033C9.62661 6.20033 4.43994 11.387 4.43994 17.7603C4.43994 24.1337 9.62661 29.3337 15.9999 29.3337C22.3733 29.3337 27.5599 24.147 27.5599 17.7737C27.5599 11.4003 22.3733 6.20033 15.9999 6.20033ZM16.9999 17.3337C16.9999 17.8803 16.5466 18.3337 15.9999 18.3337C15.4533 18.3337 14.9999 17.8803 14.9999 17.3337V10.667C14.9999 10.1203 15.4533 9.66699 15.9999 9.66699C16.5466 9.66699 16.9999 10.1203 16.9999 10.667V17.3337Z"
				fill={_fill}
			/>
			<path
				d="M19.8533 4.60033H12.1466C11.6133 4.60033 11.1866 4.17366 11.1866 3.64033C11.1866 3.10699 11.6133 2.66699 12.1466 2.66699H19.8533C20.3866 2.66699 20.8133 3.09366 20.8133 3.62699C20.8133 4.16033 20.3866 4.60033 19.8533 4.60033Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(ReminderIcon)
