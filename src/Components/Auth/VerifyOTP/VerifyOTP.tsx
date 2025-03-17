import { Flex, Input } from 'antd'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import ImageVerifyOTP from './ImageVerifyOTP'

import classes from './VerifyOTP.module.scss'

interface VerifyOTPProps {
	title: string
	phone: string
	value: string
	length?: number
	onChage?: (value: string) => void
	onInput?: (value: string[]) => void
	onAccept?: any
	[key: string]: any
}

const VerifyOTP = ({
	title,
	phone,
	value,
	length = 6,
	onChange,
	onInput,
	onAccept,
}: VerifyOTPProps) => {
	const disabled = value.length < length
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
						value={value}
						length={length}
						variant="filled"
						onChange={onChange}
						onInput={onInput}
					/>
				</Flex>
				<Flex gap={4}>
					<span className="gray">Didn't receive the code?</span>
					<span className={classes.send}>Send again </span>
				</Flex>
				<Flex className={classes.buttonWrapper}>
					<CButton
						disabled={disabled}
						style={{ flex: 1 }}
						ctype={!disabled && 'oranger'}
						onClick={onAccept}
					>
						Confirm
					</CButton>
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(VerifyOTP)
