import { Flex } from 'antd'
import React, { memo } from 'react'

import classes from './DownloadApp.module.scss'

import IconApp from './IconApp'
import CButton from '../Custom/CButton'
import { isIOS } from '@/ultis/common'

const DownloadApp = () => {
	const link = isIOS()
		? 'https://apps.apple.com/vn/app/univini/id6554002242?l=vi'
		: 'https://play.google.com/store/apps/details?id=com.vnconnections.app&hl=vi'
	return (
		<div className={classes.wrapper}>
			<Flex
				align="center"
				justify="space-between"
				className={classes.container}
			>
				<Flex align="center" gap={8}>
					<IconApp />
					<Flex vertical>
						<span style={{ fontWeight: 500 }}>UniVini</span>
						<span style={{ color: '#848489' }}>Open in the UniVini app</span>
					</Flex>
				</Flex>
				<CButton
					className={classes.bnt}
					type="primary"
					onClick={() => window.open(link, '_blank')}
				>
					OPEN
				</CButton>
			</Flex>
		</div>
	)
}

export default memo(DownloadApp)
