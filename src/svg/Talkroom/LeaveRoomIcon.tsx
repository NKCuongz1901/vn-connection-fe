import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const LeaveRoomIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#006B35'
	const _width = width || '34'
	const _height = height || '34'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={_width}
			height={_height}
			viewBox="0 0 34 34"
			fill="none"
		>
			<path
				d="M24.6625 0H20.3292C14.9958 0 11.6625 3.33333 11.6625 8.66667V15.4167H22.0792C22.7625 15.4167 23.3292 15.9833 23.3292 16.6667C23.3292 17.35 22.7625 17.9167 22.0792 17.9167H11.6625V24.6667C11.6625 30 14.9958 33.3333 20.3292 33.3333H24.6458C29.9792 33.3333 33.3125 30 33.3125 24.6667V8.66667C33.3292 3.33333 29.9958 0 24.6625 0Z"
				fill={_fill}
			/>
			<path
				d="M4.2625 15.4167L7.7125 11.9667C7.9625 11.7167 8.07917 11.4 8.07917 11.0833C8.07917 10.7667 7.9625 10.4333 7.7125 10.2C7.22917 9.71667 6.42917 9.71667 5.94583 10.2L0.3625 15.7833C-0.120833 16.2667 -0.120833 17.0667 0.3625 17.55L5.94583 23.1333C6.42917 23.6167 7.22917 23.6167 7.7125 23.1333C8.19583 22.65 8.19583 21.85 7.7125 21.3667L4.2625 17.9167H11.6625V15.4167H4.2625Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(LeaveRoomIcon)
