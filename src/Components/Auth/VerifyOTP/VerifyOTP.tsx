import { Flex, Input } from 'antd'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import ImageVerifyOTP from './ImageVerifyOTP'

import classes from './VerifyOTP.module.scss'

interface VerifyPhoneProps {
	title: string
	phone: string
	[key: string]: any
}

const VerifyPhone = ({ title, phone }: VerifyPhoneProps) => {
	return (
		<div className={classes.wrapper}>
			<Flex
				vertical
				gap={24}
				align="center"
				justify="center"
				className={classes.container}
			>
				<ImageVerifyOTP />
				<Flex vertical align="center" gap={4}>
					<div className={classes.title}>{title}</div>
					<div className={classes.note}>
						To verify that the phone number is yours, enter the 6-digit code
						sent to '<span>{phone}</span>'
					</div>
				</Flex>
				<Flex>
					<Input.OTP
						mask="*"
						formatter={(str) => str.replace(/\D/g, '')}
						length={6}
						variant="filled"
					/>
				</Flex>
				<Flex gap={4}>
					<span className="gray">Didn't receive the code?</span>
					<span className={classes.send}>Send again </span>
				</Flex>
				<Flex className={classes.buttonWrapper}>
					<CButton disabled style={{ flex: 1 }}>
						Confirm
					</CButton>
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(VerifyPhone)
