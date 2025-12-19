'use client'
import { Flex } from 'antd'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'
import WarningIcon from '@/svg/WarningIcon'

import classes from './ModalUpdateProfile.module.scss'
import ProfileIcon from '@/svg/ProfileIcon'

const rules = [
	{
		title: 'No External Chat Links',
		label:
			'Do not share links that lead to other platforms or groups with similar features outside UniVini.',
	},
	{
		title: 'No Nudity or Harassment',
		label:
			'Absolutely no nudity, sexual content, hate speech, bullying, or harassment of any kind.',
	},
	{
		title: 'No Faud or Scam',
		label:
			'Do not promote fake products, services, job offers, or attemp to scam or deceive others.',
	},
	{
		title: 'No Spam or Repetitive Messages',
		label:
			'Don’t flood the chat with repeated messages, emojis, or irrelevant promotions.',
	},
	{
		title: 'Refrain from Politics and Religion Debates',
		label:
			'These topics often lead to arguments or discomfort. Please keep the chat friendly and inclusive',
	},
]

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
