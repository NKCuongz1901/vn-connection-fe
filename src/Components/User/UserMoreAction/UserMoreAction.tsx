import { IconDots } from '@tabler/icons-react'
import { Dropdown, Flex } from 'antd'
import { CSSProperties, memo } from 'react'

import useUserMoreAction from '@/hooks/User/useUserMoreAction'

import CButton from '@/Components/Custom/CButton'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
import ModalReport from '../../Custom/ModalReport'

import classes from './UserMoreAction.module.scss'
const UserMoreAction = (props: {
	id: string
	isFriend?: any
	isNotBlock?: boolean
	isProfile?: boolean
	iconDotsStyle?: CSSProperties
	onCallback?: any
	[key: string]: any
}) => {
	const { iconDotsStyle = {} } = props
	const {
		loading,
		menus,
		open,
		loadingShare,
		shareList,
		onClose,
		onShareFriend,
	} = useUserMoreAction(props)

	const _renderMyFriendComp = (data) => {
		const { friend } = data || {}
		const { id } = friend || {}
		return (
			<div className={classes.btnShareFriend}>
				<CButton
					ctype="oranger"
					onClick={() => onShareFriend(id)}
					loading={loadingShare?.[id]}
					disabled={shareList?.[id]}
				>
					Send
				</CButton>
			</div>
		)
	}
	const _renderModal = () => {
		const { type } = open || {}
		let Content = <></>
		const propsModal = {
			open: true,
			onCancel: onClose,
			onClose: onClose,
		}
		switch (type) {
			case 'share':
				{
					Content = (
						<ModalMyFriend
							title="Share friend"
							{...propsModal}
							customComp={_renderMyFriendComp}
						/>
					)
				}
				break
			case 'report':
				Content = (
					<ModalReport
						title="Report"
						open={true}
						data={{ user_id: open.data }}
						onClose={onClose}
					/>
				)
				break
			default:
				break
		}
		return Content
	}
	return (
		<Flex onClick={(e) => e.stopPropagation()}>
			<Dropdown disabled={loading} menu={{ items: menus }} trigger={['click']}>
				<IconDots style={{ cursor: 'pointer', ...iconDotsStyle }} />
			</Dropdown>
			{_renderModal()}
		</Flex>
	)
}

export default memo(UserMoreAction)
