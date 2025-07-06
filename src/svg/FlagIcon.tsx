import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const FlagIcon = ({ fill }: SvgProps) => {
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
				d="M12.6667 5.96602L6 3.08268V2.29102C6 1.94935 5.71667 1.66602 5.375 1.66602C5.03333 1.66602 4.75 1.94935 4.75 2.29102V17.7077C4.75 18.0493 5.03333 18.3327 5.375 18.3327C5.71667 18.3327 6 18.0493 6 17.7077V14.4077L12.85 11.0243C12.85 11.0243 12.85 11.0243 12.8583 11.0243C14.2417 10.3077 14.9833 9.38268 14.9417 8.40768C14.9 7.43268 14.0917 6.56602 12.6667 5.96602Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(FlagIcon)
