import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import useChatRoomInboxChat from '@/hooks/ChatRoomInbox/useChatRoomInboxChat'

import { onPushState } from '@/ultis/route'
import { formatNumberString } from '@/ultis/string'

import MiniChatTopicBar from '@/Components/ChatLocation/MiniChatTopicBar/MiniChatTopicBar'
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

import { MiniChatItemProps } from '@/interface/Conversation/Conversation.interface'

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
	miniChatsLoading?: boolean
	onSuccess?: any
	onChangeModal?: any
}
const ChatRoomInboxChat = (props: ChatRoomInboxChatProps) => {
	const {
		convId,
		isNoHeader,
		isChatLocation,
		miniChats = [],
		miniChatsLoading,
		onChangeModal = () => null,
	} = props
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
						loading={miniChatsLoading}
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
