import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import useChatRoomInboxChat from '@/hooks/ChatRoomInbox/useChatRoomInboxChat'

import { onPushState } from '@/ultis/route.ults'

import ChatRoomChatBox from '@/Components/ChatRoomChatBox'
import CAvatar from '@/Components/Custom/CAvatar'
import ArrrowRightIcon from '@/svg/ArrrowRightIcon'
import MoreIcon from '@/svg/MoreIcon'
import People from '@/svg/People'
import PinIcon from '@/svg/PinIcon'
import ModalViewMember from '../ModalViewMember'
import ModelPin from '../ModelPin'
import SettingConv from '../SettingConv'

import classes from './ChatRoomInboxChat.module.scss'

const mappingType = {
	MEDIAS: 'Pin a image',
	STICKER: 'Pin a sticker',
}
interface ChatRoomInboxChatProps {
	convId: string
	isNoHeader?: boolean
	onSuccess?: any
	onChangeModal?: any
}
const ChatRoomInboxChat = (props: ChatRoomInboxChatProps) => {
	const { convId, isNoHeader } = props
	const {
		_scrollRef,

		total,
		messList,
		members,
		loadingPage,
		loading,
		pinList,
		totalPin,
		modal,
		setModal,
		openSetting,
		convInfo,

		setOpenSetting,
		onSendMessage,
		onActionMessage,
		onLoadMore,
		onGetPinMessage,
		onActionSettingConv,
		onAddReact,
	} = useChatRoomInboxChat(props)
	const { avatar, title } = convInfo || {}
	const _renderHeader = () => {
		if (!!isNoHeader) return
		return (
			<Flex className={classes.header}>
				{loadingPage ? (
					<Skeleton.Input className={classes.skeletonHeader} />
				) : (
					<>
						<Flex className={classes.userInChat}>
							<CAvatar src={avatar || ''} />
							<span>{title} Chat Room</span>
							<Flex
								className={classes.totalMem}
								onClick={() =>
									setModal({ type: 'member', data: { id: convId } })
								}
							>
								({total.member}
								<People />)
							</Flex>
						</Flex>
						<Flex className={classes.action}>
							<Flex
								className={classes.iconMore}
								onClick={() => {
									setOpenSetting((pre) => !pre)
								}}
							>
								<MoreIcon />
							</Flex>
							<Flex
								className={classes.iconClose}
								onClick={() => {
									onPushState({})
								}}
							>
								X
							</Flex>
						</Flex>
					</>
				)}
			</Flex>
		)
	}
	const _renderPin = () => {
		const pin = totalPin - 1
		return (
			<Flex
				className={classes.pinMess}
				onClick={() => setModal({ type: 'pin', data: { id: convId } })}
			>
				<Flex className={classes.pinLeft}>
					<Flex className={classes.pinIcon}>
						<PinIcon />
					</Flex>
					<Flex className={classes.pinInfo} vertical>
						<span className={classes.titlePin}>Pinned messages</span>
						<div className={classes.pinLastMess}>
							{pinList[0]?.sender?.name}:{' '}
							{mappingType[pinList[0]?.type] || pinList[0]?.content}
						</div>
					</Flex>
				</Flex>
				{!!pin && (
					<Flex className={classes.numberPin}>
						<span className={classes.text}>+ {pin}</span>
						<ArrrowRightIcon />
					</Flex>
				)}
			</Flex>
		)
	}
	const _renderModal = () => {
		const { type, data } = modal
		let content = <></>
		switch (type) {
			case 'pin':
				content = (
					<ModelPin
						data={data || ''}
						onClose={() => {
							onGetPinMessage()
							setModal(null)
						}}
					/>
				)
				break
			case 'member':
				content = (
					<ModalViewMember
						id={data?.id || ''}
						onClose={() => {
							onGetPinMessage()
							setModal(null)
						}}
					/>
				)
				break

			default:
				break
		}
		return content
	}
	return (
		<div className={classes.InboxChatWrapper}>
			<Flex
				className={clsx(classes.chatContainer, { [classes.mini]: openSetting })}
				vertical
			>
				{_renderHeader()}
				{/* {isArray(pinList, 1) && _renderPin()} */}
				<Flex className={classes.chatBox}>
					<ChatRoomChatBox
						convId={convId}
						itemList={messList}
						loading={loading}
						onLoadMore={onLoadMore}
						_scrollRef={_scrollRef}
						onSendMessage={onSendMessage}
						onActionMessage={onActionMessage}
						onAddReact={onAddReact}
					/>
				</Flex>
			</Flex>
			{openSetting && (
				<SettingConv
					convInfo={convInfo}
					members={members}
					onAction={onActionSettingConv}
				/>
			)}

			{modal?.type && _renderModal()}
		</div>
	)
}

export default memo(ChatRoomInboxChat)
