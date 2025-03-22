import { Steps, StepsProps } from 'antd'
import { memo } from 'react'

import './CSteps.scss'

const CSteps = (_props: StepsProps) => {
	const { ...props } = _props
	return (
		<Steps
			responsive={false}
			size="small"
			current={2}
			className="StepsWrapper"
			direction="horizontal"
			labelPlacement="vertical"
			{...props}
		/>
	)
}

export default memo(CSteps)
