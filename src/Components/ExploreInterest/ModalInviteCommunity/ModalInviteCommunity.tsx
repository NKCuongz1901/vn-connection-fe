import { Flex } from 'antd'
import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import AttachIcon from '@/svg/FriendSvg/AttachIcon'

import ConversationClub from '../ConversationClub'
import classes from './ModalInviteCommunity.module.scss'

interface ModalInviteCommunityProps {
	title: string
	onClose: any
	id?: string
	customComp?: any
	desc?: {
		label?: string
		icon?: any
	}
	onCopy?: any
}

const ModalInviteCommunity = (_props: ModalInviteCommunityProps) => {
	const { onClose, onCopy, customComp, title, desc, id } = _props
	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={title}
				styles={{
					content: {
						width: 800,
					},
				}}
				footer={[<div key="back"></div>]}
			>
				<Flex vertical>
					<ConversationClub
						id={id}
						desc={
							desc || {
								label: 'Share link to your friends',
								icon: <AttachIcon />,
							}
						}
						customComp={customComp}
						onCopy={onCopy}
					/>
				</Flex>
			</CModal>
		</div>
	)
}

export default memo(ModalInviteCommunity)
