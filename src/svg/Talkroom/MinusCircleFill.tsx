import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const MinusCircleFill = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#94A3B8'
	const _width = width || '14'
	const _height = height || '14'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
		>
			<path
				d="M6.66667 0C2.99333 0 0 2.99333 0 6.66667C0 10.34 2.99333 13.3333 6.66667 13.3333C10.34 13.3333 13.3333 10.34 13.3333 6.66667C13.3333 2.99333 10.34 0 6.66667 0ZM9.28 7.16667H3.94667C3.67333 7.16667 3.44667 6.94 3.44667 6.66667C3.44667 6.39333 3.67333 6.16667 3.94667 6.16667H9.28C9.55333 6.16667 9.78 6.39333 9.78 6.66667C9.78 6.94 9.56 7.16667 9.28 7.16667Z"
				fill="#0F1729"
			/>
		</svg>
	)
}

export default memo(MinusCircleFill)
