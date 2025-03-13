import { InputProps, Select } from 'antd'
import { memo } from 'react'

import CInput from '../CInput/CInput'

import { countryCodes } from '@/Variable/common.variable'

const { Option } = Select

interface CInputPhoneProps {
	prefix?: string
	onChangePrefix?: any
}

const CInputPhone = ({
	prefix,
	onChangePrefix,
	...props
}: CInputPhoneProps & InputProps) => {
	const selectBefore = (
		<Select value={prefix} onChange={onChangePrefix} style={{ width: 90 }}>
			{countryCodes.map((i) => (
				<Option key={i.dial_code} value={i.dial_code}>
					{i.dial_code}
				</Option>
			))}
		</Select>
	)
	return <CInput addonBefore={selectBefore} {...props} />
}

export default memo(CInputPhone)
