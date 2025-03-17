import { Steps, StepsProps } from 'antd'
import { memo } from 'react'

import './CSteps.scss'

const CSteps = (_props: StepsProps) => {
	const { ...props } = _props
	return (
		<Steps
			style={{
				color: 'red',
			}}
			size="small"
			current={2}
			className="StepsWrapper"
			{...props}
		/>
	)
}

export default memo(CSteps)
