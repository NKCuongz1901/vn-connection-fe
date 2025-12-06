import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const CcIcon = ({ fill }: SvgProps) => {
	const _fill = fill || '#006B35'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="13"
			viewBox="0 0 12 13"
			fill="none"
		>
			<path
				d="M3.08 12.3667C2.55333 12.3667 2.05333 12.24 1.61333 11.9867C0.573333 11.3867 0 10.1667 0 8.56005V3.80672C0 2.19338 0.573333 0.980051 1.61333 0.380051C2.65333 -0.219949 3.99333 -0.106616 5.39333 0.700051L9.50667 3.07338C10.9 3.88005 11.6733 4.98672 11.6733 6.18672C11.6733 7.38672 10.9067 8.49338 9.50667 9.30005L5.39333 11.6734C4.58667 12.1334 3.8 12.3667 3.08 12.3667Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(CcIcon)
