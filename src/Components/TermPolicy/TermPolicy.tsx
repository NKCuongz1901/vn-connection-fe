import { Flex } from 'antd'
import { memo } from 'react'

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
			}}
		>
			<Flex gap={12}>
				<span>Terms of Use</span>
				<span>Privacy Policy</span>
			</Flex>
			<span>Copyrightⓒ(Inc)UniVini. All rights reserved.</span>
		</Flex>
	)
}

export default memo(TermPolicy)
