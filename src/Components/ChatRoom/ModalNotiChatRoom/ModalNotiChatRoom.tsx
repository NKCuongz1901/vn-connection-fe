import { Flex } from 'antd'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'
import WarningIcon from '@/svg/WarningIcon'

import classes from './ModalNotiChatRoom.module.scss'

const rules = [
	{
		title: 'No External Chat Links',
		label: (
			<span>
				<span style={{ color: '#E55A0F' }}>Do not share links </span>that lead
				to other platforms or groups with similar features outside UniVini.
			</span>
		),
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

interface ModalCRUDDiscussionProps {
	open: boolean
	conversation_id?: string
	topic?: any[]
	data?: any
	onClose: any
	onSubmit?: any
	[key: string]: any
}
const ModalNotiChatRoom = (props: ModalCRUDDiscussionProps) => {
	const { onSubmit = () => null, onClose = () => null } = props || {}

	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={
					<Flex className={classes.titleModal}>
						<WarningIcon /> UniVini Chat Rules Avoid Being Banned
					</Flex>
				}
				styles={{
					content: {
						width: 600,
					},
				}}
				footer={[
					<Flex key="back" justify="flex-end">
						<CButton
							onClick={onSubmit}
							ctype="oranger"
							style={{ width: '100%' }}
						>
							I understand
						</CButton>
					</Flex>,
				]}
			>
				<div className={classes.container}>
					<Flex className={classes.wrapperModal} vertical>
						{rules.map((rule, index) => {
							const { title, label } = rule
							return (
								<Flex vertical key={title} className={classes.ruleItem}>
									<div className={classes.ruleTitle}>
										{index + 1}. {title}
									</div>
									<div className={classes.ruleLabel}> {label}</div>
								</Flex>
							)
						})}
					</Flex>
				</div>
			</CModal>
		</div>
	)
}
export default memo(ModalNotiChatRoom)
