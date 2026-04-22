import { Flex } from 'antd'
import { memo } from 'react'
import { buildVersion } from '../../../utils/version'
import Link from 'next/link'
import { useLocalePath } from '@/ultis/route'
import { mainRoutes } from '@/routes/MainRoutes'

const TermPolicy = () => {
	const { onGetPath } = useLocalePath()
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
				<Link href={onGetPath(`${mainRoutes.policyTerm}?type=TERMS`)}>
					Terms of Use
				</Link>
				<Link href={onGetPath(`${mainRoutes.policyTerm}?type=POLICY`)}>
					Privacy Policy
				</Link>
			</Flex>
			<span>Copyrightⓒ(Inc)UniVini. All rights reserved.</span>
			<span>Version: {buildVersion}</span>
		</Flex>
	)
}

export default memo(TermPolicy)
