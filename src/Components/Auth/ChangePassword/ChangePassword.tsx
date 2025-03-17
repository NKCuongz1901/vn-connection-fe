import { Flex } from 'antd'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CInputPassword from '@/Components/Custom/CInputPassword'
import ImageChangePassword from './ImageChangePassword'

import classes from './ChangePassword.module.scss'

interface ChangePasswordProps {
	title: string
	note: string
	[key: string]: any
}

const ChangePassword = ({
	title = 'Change your password',
	note,
}: ChangePasswordProps) => {
	return (
		<div className={classes.wrapper}>
			<Flex
				vertical
				gap={24}
				align="center"
				justify="center"
				className={classes.container}
			>
				<ImageChangePassword />
				<Flex vertical align="center" gap={4}>
					<div className={classes.title}>{title}</div>
					<div className={classes.note}>{note}</div>
				</Flex>
				<Flex vertical gap={12} className="fullW">
					<CInputPassword isRequired label="New password" />
					<CInputPassword isRequired label="Confirm password" />
				</Flex>

				<Flex className={classes.buttonWrapper}>
					<CButton ctype="disabled" style={{ flex: 1 }}>
						Cancel
					</CButton>
					<CButton ctype="oranger" disabled style={{ flex: 1 }}>
						Continue
					</CButton>
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(ChangePassword)
