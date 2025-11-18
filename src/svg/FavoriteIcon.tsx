import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const FavoriteIcon = ({ fill }: SvgProps) => {
	const _fill = fill || '#006B35'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="19"
			height="19"
			viewBox="0 0 19 19"
			fill="none"
		>
			<path
				d="M9.01 0C4.04 0 0 4.04 0 9.01C0 13.98 4.04 18.02 9.01 18.02C13.98 18.02 18.02 13.98 18.02 9.01C18.02 4.04 13.98 0 9.01 0ZM12.19 9.57C11.63 11.35 9.68 12.32 9.01 12.32C8.32 12.32 6.41 11.39 5.83 9.57C5.45 8.38 5.88 6.83 7.24 6.4C7.86 6.2 8.52 6.32 9.01 6.69C9.49 6.32 10.16 6.2 10.79 6.4C12.14 6.84 12.57 8.39 12.19 9.57Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(FavoriteIcon)
