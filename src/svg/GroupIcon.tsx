import { memo } from 'react'

import { SvgProps } from '@/interface/common/common.interface'
import animationData from '@/assets/lottie/fire.json'
import Lottie from 'lottie-react'

const GroupIcon = (_props: SvgProps) => {
	return (
		<Lottie
			animationData={animationData}
			loop
			autoplay
			style={{ width: 16, height: 16 }}
			{..._props}
		/>
	)
}

export default memo(GroupIcon)
