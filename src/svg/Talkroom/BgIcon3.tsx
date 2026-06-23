import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const BgIcon3 = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#94A3B8'
	const _width = width || '14'
	const _height = height || '14'
	return (
		<svg width="68" height="68" viewBox="0 0 68 68" fill="none">
			{/* Gom về tâm 68x68 */}
			<g transform="translate(34 34)">
				<rect
					x="-18"
					y="-40.6"
					width="36"
					height="81.2"
					rx="18"
					fill="#E7F5E9"
					transform="rotate(45)"
				/>
				<rect
					x="-18"
					y="-40.6"
					width="36"
					height="81.2"
					rx="18"
					fill="#E7F5E9"
					transform="rotate(-45)"
				/>
			</g>
		</svg>
	)
}

export default memo(BgIcon3)
