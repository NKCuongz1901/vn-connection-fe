import { IconCircle, IconCircleCheckFilled } from '@tabler/icons-react'
import { Flex } from 'antd'

import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'
import { PROFILE_COMPLETENESS_ITEMS } from '@/Variable/profileCompleteness.variable'

import classes from './ModalProfileComplete.module.scss'

type CompleteProfileData = {
	about_me?: boolean
	email_verified?: boolean
	profile_photo?: boolean
	interests?: boolean
	friend_about?: boolean
	languages?: boolean
	countries?: boolean
	reference_1?: boolean
	reference_2?: boolean
	point?: number
}

type ModalProfileCompleteProps = {
	completeData?: CompleteProfileData
	onClose: () => void
	onCompleteProfile: () => void
}

function ModalProfileComplete(_props: ModalProfileCompleteProps) {
	const { completeData, onClose, onCompleteProfile } = _props

	return (
		<div className={classes.wrapper}>
			<CModal
				footer={null}
				onClose={onClose}
				onCancel={onClose}
				title={<span className={classes.title}>Profile completeness</span>}
				styles={{
					content: {
						width: 660,
						borderRadius: 8,
						padding: '16px 24px 24px',
					},
					body: {
						scrollbarWidth: 'none',
						msOverflowStyle: 'none',
					},
				}}
			>
				<Flex vertical className={classes.container}>
					{PROFILE_COMPLETENESS_ITEMS.map((item) => {
						const done = !!completeData?.[item.key]
						return (
							<Flex
								key={item.key}
								className={classes.row}
								align="center"
								justify="space-between"
							>
								<Flex className={classes.left} align="center" gap={8}>
									{done ? (
										<IconCircleCheckFilled size={24} color="#006B35" />
									) : (
										<IconCircle size={24} color="#94A3B8" stroke={1.5} />
									)}
									<span className={classes.label}>{item.label}</span>
								</Flex>
								<span
									className={`${classes.status} ${
										done ? classes.done : classes.percent
									}`}
								>
									{done ? 'Done' : `${item.weight}%`}
								</span>
							</Flex>
						)
					})}
					<CButton
						ctype="oranger"
						style={{ width: '100%', height: 44, marginTop: 12 }}
						onClick={onCompleteProfile}
					>
						Complete Profile
					</CButton>
				</Flex>
			</CModal>
		</div>
	)
}

export default ModalProfileComplete
