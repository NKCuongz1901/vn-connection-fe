import { Flex, Input } from 'antd'
import clsx from 'clsx'
import { memo, useState } from 'react'

import CButton from '@/Components/Custom/CButton'
import CCountDown from '@/Components/Custom/CCountDown/CCountDown'
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
	onSendAgain?: any
	onChangeStep?: any
	hiddenChangeStep?: boolean
	className?: any
	disabled?: boolean
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
	onSendAgain,
	hiddenChangeStep,
	onChangeStep,
	className,
	disabled: _disabled,
}: VerifyOTPProps) => {
	const disabled = value.length < length || _disabled
	const [isSendAgain, setIsSendAgain] = useState(false)
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
				<Flex vertical align="center" gap={4}>
					<div className={classes.title}>{title}</div>
					<div className={classes.note}>
						To verify that the phone number is yours, enter the 6-digit code
						sent to '<span>{phone}</span>'
					</div>
				</Flex>
				<Flex>
					<Input.OTP
						// mask=""
						formatter={(str) => str.replace(/\D/g, '')}
						value={value}
						length={length}
						variant="filled"
						onChange={onChange}
						onInput={onInput}
					/>
				</Flex>
				<Flex gap={4} vertical align="center">
					<Flex>
						<span className="gray">Didn't receive the code?</span>
						{isSendAgain ? (
							<span
								className={classes.send}
								onClick={() => {
									onSendAgain()
									setIsSendAgain(false)
								}}
							>
								&nbsp;Send again
							</span>
						) : (
							<span className={classes.sendCountDown}>
								&nbsp;Send again{' '}
								<CCountDown
									start={120}
									onCountSuccess={() => setIsSendAgain(true)}
								/>{' '}
								second(s)
							</span>
						)}
					</Flex>
					{!hiddenChangeStep && (
						<span className={classes.send} onClick={() => onChangeStep(0)}>
							Change your phone number
						</span>
					)}
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
