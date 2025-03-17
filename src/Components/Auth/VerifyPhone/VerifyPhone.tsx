import { Flex } from 'antd'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CInputPhone from '@/Components/Custom/CInputPhone'
import ImageVerifyPhone from './ImageVerifyPhone'

import classes from './VerifyPhone.module.scss'

interface VerifyPhoneProps {
	prefix: string
	title: string
	value: string
	onChangePrefix: any
	onChange: any
	onAccept: any
	[key: string]: any
}

const VerifyPhone = ({
	title,
	prefix,
	value,
	onChangePrefix,
	onChange,
	onAccept,
}: VerifyPhoneProps) => {
	return (
		<div className={classes.wrapper}>
			<Flex
				vertical
				gap={24}
				align="center"
				justify="center"
				className={classes.container}
			>
				<ImageVerifyPhone />
				<Flex vertical align="center" gap={4}>
					<div className={classes.title}>{title}</div>
					<span className="gray">
						Enter your phone number we’ll verify your phone
					</span>
				</Flex>
				<CInputPhone
					prefix={prefix}
					value={value}
					onChangePrefix={onChangePrefix}
					onChange={onChange}
					placeholder="Phone number"
					maxLength={255}
				/>
				<Flex className={classes.buttonWrapper}>
					<CButton ctype="disabled" style={{ flex: 1 }}>
						Cancel
					</CButton>
					<CButton ctype="oranger" style={{ flex: 1 }} onClick={onAccept}>
						Continue
					</CButton>
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(VerifyPhone)
