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
				<Link href={onGetPath(mainRoutes.term)}>
					Terms of Use
				</Link>
				<Link href={onGetPath(mainRoutes.policy)}>
					Privacy Policy
				</Link>
			</Flex>
			<span>VN CONNECTIONS COMPANY LIMITED</span>
			<span style={{ textAlign: 'center', maxWidth: 360 }}>
				Address: 2A Phan Tay Ho, Ward 7, Phu Nhuan District, Ho Chi Minh
				City, Viet Nam, 700000
			</span>
			<span>
				Contact:{' '}
				<a href="mailto:support@univini.com" style={{ color: 'inherit' }}>
					support@univini.com
				</a>
			</span>
			<span>
				© 2026 VN CONNECTIONS COMPANY LIMITED. All rights reserved.
			</span>
			<span>Version: {buildVersion}</span>
		</Flex>
	)
}

export default memo(TermPolicy)
