import { Flex } from 'antd'
import { memo } from 'react'
import { buildVersion } from '../../../utils/version'

const TermPolicy = () => {
	return (
		<Flex
			vertical
			justify="center"
			align="center"
			gap={4}
			style={{
				color: '#48546b',
				fontSize: 12,
				width: '100%',
			}}
		>
			<Flex gap={12}>
				<span>Terms of Use 1234</span>
				<span>Privacy Policy</span>
			</Flex>
			<span>Copyrightⓒ(Inc)UniVini. All rights reserved.</span>
			<span>Version: {buildVersion}</span>

								
		</Flex>
	)
}

export default memo(TermPolicy)
