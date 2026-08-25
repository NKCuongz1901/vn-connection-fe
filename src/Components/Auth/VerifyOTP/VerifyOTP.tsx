import { Flex, Input } from 'antd'
import clsx from 'clsx'
import { memo, useState } from 'react'

import CButton from '@/Components/Custom/CButton'
import CCountDown from '@/Components/Custom/CCountDown/CCountDown'
import ImageVerifyOTP from './ImageVerifyOTP'

import classes from './VerifyOTP.module.scss'

interface VerifyOTPProps {
	title?: string
	phone?: string
	destination?: string
	channel?: 'email' | 'sms' | 'zalo' | 'whatsapp'
	value: string
	length?: number
	onChage?: (value: string) => void
	onInput?: (value: string[]) => void
	onAccept?: any
	onSendAgain?: any
	onChangeStep?: any
	onSwitchToSms?: any
	hiddenChangeStep?: boolean
	showSwitchToPhone?: boolean
	className?: any
	disabled?: boolean
	[key: string]: any
}

const VerifyOTP = ({
	title = 'Enter Your Verification Code',
	phone,
	destination,
	channel = 'sms',
	value,
	length = 6,
	onChange,
	onInput,
	onAccept,
	onSendAgain,
	hiddenChangeStep,
	onChangeStep,
	onSwitchToSms,
	showSwitchToPhone = false,
	className,
	disabled: _disabled,
}: VerifyOTPProps) => {
	const disabled = value.length < length || _disabled
	const [isSendAgain, setIsSendAgain] = useState(false)
	const displayDestination = destination || phone || ''

	return (
		<div className={clsx(classes.wrapper, { [className]: !!className })}>
			<Flex
				vertical
				gap={24}
				align="center"
				justify="center"
				className={classes.container}
			>
				<ImageVerifyOTP />
				<Flex vertical align="center" gap={8} className={classes.textBlock}>
					<div className={classes.title}>{title}</div>
					<div className={classes.note}>
						{channel === 'email' ? (
							<>
								We have sent a one-time passcode to{' '}
								<span>&ldquo;{displayDestination}&rdquo;</span>
							</>
						) : (
							<>
								To verify that the phone number is yours, enter the 6-digit code
								sent to <span>&ldquo;{displayDestination}&rdquo;</span>
							</>
						)}
					</div>
				</Flex>
				<div className={classes.otpInput}>
					<Input.OTP
						formatter={(str) => str.replace(/\D/g, '')}
						value={value}
						length={length}
						variant="filled"
						onChange={onChange}
						onInput={onInput}
					/>
				</div>
				<Flex gap={4} align="center" className={classes.resendRow}>
					<span className={classes.resendLabel}>
						Didn&apos;t receive the code?
					</span>
					{isSendAgain ? (
						<button
							type="button"
							className={classes.send}
							onClick={() => {
								onSendAgain?.()
								setIsSendAgain(false)
							}}
						>
							Send again
						</button>
					) : (
						<span className={classes.sendCountDown}>
							Send again{' '}
							<CCountDown
								start={120}
								onCountSuccess={() => setIsSendAgain(true)}
							/>{' '}
							second(s)
						</span>
					)}
				</Flex>
				{showSwitchToPhone && channel === 'email' && (
					<button
						type="button"
						className={classes.switchChannelLink}
						onClick={onSwitchToSms}
					>
						Get OTP via phone
					</button>
				)}
				{!hiddenChangeStep && channel === 'sms' && (
					<button
						type="button"
						className={classes.switchChannelLink}
						onClick={() => onChangeStep?.(0)}
					>
						Change your phone number
					</button>
				)}
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
