import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const UserTagIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#006B35'
	const _width = width || '30'
	const _height = height || '34'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={_width}
			height={_height}
			viewBox="0 0 30 34"
			fill="none"
		>
			<path
				d="M25 0H5C2.23333 0 0 2.21667 0 4.95V23.1333C0 25.8667 2.23333 28.0833 5 28.0833H6.26667C7.6 28.0833 8.86667 28.6 9.8 29.5333L12.65 32.35C13.95 33.6333 16.0667 33.6333 17.3667 32.35L20.2167 29.5333C21.15 28.6 22.4333 28.0833 23.75 28.0833H25C27.7667 28.0833 30 25.8667 30 23.1333V4.95C30 2.21667 27.7667 0 25 0ZM15 6.25C17.15 6.25 18.8833 7.98333 18.8833 10.1333C18.8833 12.2833 17.15 14.0167 15 14.0167C12.85 14.0167 11.1167 12.2667 11.1167 10.1333C11.1167 7.98333 12.85 6.25 15 6.25ZM19.4667 21.7667H10.5333C9.18333 21.7667 8.4 20.2667 9.15 19.15C10.2833 17.4667 12.4833 16.3333 15 16.3333C17.5167 16.3333 19.7167 17.4667 20.85 19.15C21.6 20.2667 20.8 21.7667 19.4667 21.7667Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(UserTagIcon)
