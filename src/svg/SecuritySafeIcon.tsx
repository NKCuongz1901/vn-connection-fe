import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

/** Shield icon for OTP method security note (Figma). */
const SecuritySafeIcon = ({ fill, width, height }: SvgProps) => {
	const _fill = fill || '#48546B'
	const _width = width || 16
	const _height = height || 16

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={_width}
			height={_height}
			viewBox="0 0 12 14"
			fill="none"
			aria-hidden
		>
			<path
				d="M11.88 6.07508V3.14841C11.88 2.60175 11.4667 1.98175 10.9533 1.77508L7.24001 0.255081C6.40667 -0.0849186 5.46667 -0.0849186 4.63334 0.255081L0.920005 1.77508C0.413338 1.98175 5.126e-06 2.60175 5.126e-06 3.14841V6.07508C5.126e-06 9.33508 2.36667 12.3884 5.60001 13.2817C5.82001 13.3417 6.06001 13.3417 6.28001 13.2817C9.51334 12.3884 11.88 9.33508 11.88 6.07508ZM6.44001 7.24175V8.99508C6.44001 9.26842 6.21334 9.49508 5.94001 9.49508C5.66667 9.49508 5.44001 9.26842 5.44001 8.99508V7.24175C4.76667 7.02842 4.27334 6.40175 4.27334 5.66175C4.27334 4.74175 5.02001 3.99508 5.94001 3.99508C6.86001 3.99508 7.60667 4.74175 7.60667 5.66175C7.60667 6.40842 7.11334 7.02842 6.44001 7.24175Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(SecuritySafeIcon)
