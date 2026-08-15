import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo, useState } from 'react'

import useChatRoomInboxChat from '@/hooks/ChatRoomInbox/useChatRoomInboxChat'

import { onPushState } from '@/ultis/route'
import { formatNumberString } from '@/ultis/string'

import MiniChatTopicBar from '@/Components/ChatLocation/MiniChatTopicBar/MiniChatTopicBar'
import ModalLeaveMiniChat from '@/Components/ChatLocation/ModalSelectMiniChat/ModalLeaveMiniChat'
import ModalSelectMiniChat from '@/Components/ChatLocation/ModalSelectMiniChat/ModalSelectMiniChat'
import ChatRoomChatBox from '@/Components/ChatRoomChatBox'
import AdminDeleteMessageModal, {
	AdminDeleteMessageReasonModal,
} from '@/Components/Modal/AdminDeleteMessageModal'
import CAvatar from '@/Components/Custom/CAvatar'
import ArrrowRightIcon from '@/svg/ArrrowRightIcon'
import BookIcon from '@/svg/BookIcon'
import MarkIcon from '@/svg/MarkIcon'
import MoreIcon from '@/svg/MoreIcon'
import People from '@/svg/People'
import PinIcon from '@/svg/PinIcon'
import ModalViewMember from '../ModalViewMember'
import ModelPin from '../ModelPin'
import SettingConv from '../SettingConv'

import {
	FullMiniChatItemProps,
	MiniChatItemProps,
} from '@/interface/Conversation/Conversation.interface'

import classes from './ChatRoomInboxChat.module.scss'

const mappingType = {
	MEDIAS: 'Pin a image',
	STICKER: 'Pin a sticker',
}
interface ChatRoomInboxChatProps {
	convId: string
	isNoHeader?: boolean
	isChatLocation?: boolean
	miniChats?: MiniChatItemProps[]
	fullMiniChats?: FullMiniChatItemProps[]
	activeMiniChatId?: string
	miniChatsLoading?: boolean
	fullMiniChatsLoading?: boolean
	miniChatActionId?: string
	onSelectMiniChat?: (
		item: Pick<MiniChatItemProps, 'id'>,
		options?: { isJoining?: boolean },
	) => void
	onSelectParentChat?: () => void
	onLeaveMiniChat?: (item: FullMiniChatItemProps) => Promise<boolean>
	onSuccess?: any
	onChangeModal?: any
}
const ChatRoomInboxChat = (props: ChatRoomInboxChatProps) => {
	const {
		convId,
		isNoHeader,
		isChatLocation,
		miniChats = [],
		fullMiniChats = [],
		activeMiniChatId,
		miniChatsLoading,
		fullMiniChatsLoading,
		miniChatActionId,
		onSelectMiniChat,
		onSelectParentChat,
		onLeaveMiniChat,
		onChangeModal = () => null,
	} = props
	const [openSelectMiniChat, setOpenSelectMiniChat] = useState(false)
	const [leaveMiniChatTarget, setLeaveMiniChatTarget] =
		useState<FullMiniChatItemProps | null>(null)

	// Open a mini chat or request confirmation before leaving a joined room.
	const handleSelectFullMiniChat = (item: FullMiniChatItemProps) => {
		setOpenSelectMiniChat(false)
		if (item.joined) {
			setLeaveMiniChatTarget(item)
			return
		}
		onSelectMiniChat?.(item, { isJoining: true })
	}

	// Confirm leaving the selected joined mini chat.
	const handleConfirmLeaveMiniChat = async () => {
		if (!leaveMiniChatTarget || !onLeaveMiniChat) return
		const success = await onLeaveMiniChat(leaveMiniChatTarget)
		if (success) setLeaveMiniChatTarget(null)
	}

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
		editingMessage,
		onEditMessage,
		onCancelEdit,
		onActionMessage,
		onLoadMore,
		onGetPinMessage,
		onActionSettingConv,
		onAddReact,
		onEnsureMessageLoaded,
		loadingEnsureMessage,
		adminDeleteTarget,
		openAdminDeleteReason,
		reportContents,
		loadingReportContents,
		onCloseAdminDelete,
		onCloseAdminDeleteReason,
		onAdminDeleteConfirm,
		onAdminDeleteReasonConfirm,
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
							{isChatLocation ? (
								<span className={classes.locationIcon}>
									<MarkIcon fill="#94A3B8" width={24} height={24} />
								</span>
							) : (
								<CAvatar src={avatar || ''} />
							)}
							<span>{isChatLocation ? title : `${title} Chat Room`}</span>
							<Flex
								className={classes.totalMem}
								onClick={() =>
									setModal({ type: 'member', data: { id: convId } })
								}
							>
								({formatNumberString(total.member)}
								<People />)
							</Flex>
						</Flex>
						<Flex className={classes.action}>
							<Flex
								className={classes.iconMore}
								onClick={() => {
									onChangeModal({ type: 'rule' })
								}}
							>
								<BookIcon />
							</Flex>
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
				{isChatLocation && (
					<MiniChatTopicBar
						items={miniChats}
						activeId={activeMiniChatId}
						loading={miniChatsLoading}
						onExpand={() => setOpenSelectMiniChat(true)}
						onSelect={onSelectMiniChat}
						onSelectHome={onSelectParentChat}
					/>
				)}
				{/* {isArray(pinList, 1) && _renderPin()} */}
				<Flex className={classes.chatBox}>
					<ChatRoomChatBox
						convId={convId}
						itemList={messList}
						loading={loading}
						onLoadMore={onLoadMore}
						_scrollRef={_scrollRef}
						onSendMessage={onSendMessage}
						editingMessage={editingMessage}
						onEditMessage={onEditMessage}
						onCancelEdit={onCancelEdit}
						onActionMessage={onActionMessage}
						onAddReact={onAddReact}
						onEnsureMessageLoaded={onEnsureMessageLoaded}
						loadingEnsureMessage={loadingEnsureMessage}
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
			{openSelectMiniChat && (
				<ModalSelectMiniChat
					items={fullMiniChats}
					loading={fullMiniChatsLoading}
					onClose={() => setOpenSelectMiniChat(false)}
					onSelect={handleSelectFullMiniChat}
				/>
			)}
			{leaveMiniChatTarget && (
				<ModalLeaveMiniChat
					loading={miniChatActionId === leaveMiniChatTarget.id}
					onCancel={() => setLeaveMiniChatTarget(null)}
					onConfirm={handleConfirmLeaveMiniChat}
				/>
			)}

			<AdminDeleteMessageModal
				open={!!adminDeleteTarget && !openAdminDeleteReason}
				senderName={adminDeleteTarget?.user?.name || ''}
				onClose={onCloseAdminDelete}
				onConfirm={onAdminDeleteConfirm}
			/>

			<AdminDeleteMessageReasonModal
				open={openAdminDeleteReason}
				options={reportContents}
				loading={loadingReportContents}
				onClose={onCloseAdminDeleteReason}
				onConfirm={onAdminDeleteReasonConfirm}
			/>
		</div>
	)
}

export default memo(ChatRoomInboxChat)
