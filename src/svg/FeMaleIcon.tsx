import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'

const FeMaleIcon = ({ fill }: SvgProps) => {
	const _fill = fill || '#ED5DCD'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="9"
			height="12"
			viewBox="0 0 9 12"
			fill="none"
		>
			<path
				d="M8.09639 4.04819C8.09639 1.81012 6.28626 0 4.04819 0C1.81012 0 0 1.81012 0 4.04819C0 6.14169 1.58458 7.85928 3.61446 8.07325V9.39759H2.31325C2.07614 9.39759 1.87952 9.59422 1.87952 9.83132C1.87952 10.0684 2.07614 10.2651 2.31325 10.2651H3.61446V11.5663C3.61446 11.8034 3.81108 12 4.04819 12C4.2853 12 4.48193 11.8034 4.48193 11.5663V10.2651H5.78313C6.02024 10.2651 6.21687 10.0684 6.21687 9.83132C6.21687 9.59422 6.02024 9.39759 5.78313 9.39759H4.48193V8.07325C6.51181 7.85928 8.09639 6.14169 8.09639 4.04819Z"
				fill={_fill}
			/>
		</svg>
	)
}

export default memo(FeMaleIcon)
