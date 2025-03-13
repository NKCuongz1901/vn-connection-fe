import { Flex } from 'antd'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CInputPhone from '@/Components/Custom/CInputPhone'
import ImageVerifyPhone from './ImageVerifyPhone'

import classes from './VerifyPhone.module.scss'

interface VerifyPhoneProps {
	title: string
}

const VerifyPhone = ({ title }: VerifyPhoneProps) => {
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
					// prefix={''}
					// value={''}
					// onChangePrefix={() => null}
					// onChange={() => null}
					placeholder="Phone number"
					maxLength={255}
				/>
				<Flex className={classes.buttonWrapper}>
					<CButton ctype="disabled" style={{ flex: 1 }}>
						Cancel
					</CButton>
					<CButton ctype="oranger" style={{ flex: 1 }}>
						Continue
					</CButton>
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(VerifyPhone)
