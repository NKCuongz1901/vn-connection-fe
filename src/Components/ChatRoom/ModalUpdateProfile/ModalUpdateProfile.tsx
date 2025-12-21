'use client'
import { Flex } from 'antd'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'

import ProfileIcon from '@/svg/ProfileIcon'
import classes from './ModalUpdateProfile.module.scss'

interface ModalUpdateProfileProps {
	open: boolean
	conversation_id?: string
	topic?: any[]
	data?: any
	onClose: any
	onSubmit?: any
	[key: string]: any
}
const ModalUpdateProfile = (props: ModalUpdateProfileProps) => {
	const { onSubmit = () => null, onClose = () => null } = props || {}

	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={
					<Flex className={classes.titleModal}>
						<ProfileIcon />
					</Flex>
				}
				styles={{
					content: {
						width: 340,
						height: 200,
						minHeight: 200,
					},
				}}
				footer={[
					<Flex key="back" justify="flex-end">
						<CButton
							onClick={onSubmit}
							ctype="oranger"
							style={{ width: '100%' }}
						>
							Update profile
						</CButton>
					</Flex>,
				]}
			>
				<div className={classes.container}>
					<b style={{ fontSize: 20 }}>To join the Chat Rooms</b>
					<div>
						Please update your profile photo and select the languages you speak.
					</div>
				</div>
			</CModal>
		</div>
	)
}
export default memo(ModalUpdateProfile)
