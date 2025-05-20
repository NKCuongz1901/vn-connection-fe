import { Flex } from 'antd'
import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import AttachIcon from '@/svg/FriendSvg/AttachIcon'
import MyFriend from '../MyFriend'

import classes from './ModalMyFriend.module.scss'

interface ModalMyFriendProps {
	title: string
	onClose: any
	customComp?: any
	desc?: {
		label?: string
		icon?: any
	}
}

const ModalMyFriend = (_props: ModalMyFriendProps) => {
	const { onClose, customComp, title, desc } = _props
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
					<MyFriend
						desc={
							desc || {
								label: 'Share link to your friends',
								icon: <AttachIcon />,
							}
						}
						customComp={customComp}
					/>
				</Flex>
			</CModal>
		</div>
	)
}

export default memo(ModalMyFriend)
