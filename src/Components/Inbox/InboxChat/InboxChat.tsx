import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo, useMemo } from 'react'

import { isArray } from '@/ultis/array'
import { toJson } from '@/ultis/common'
import { onPushState } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'

import ChatBox from '@/Components/ChatBox'
import CAvatar from '@/Components/Custom/CAvatar'
import useInboxChat from '@/hooks/Inbox/useInboxChat'
import MoreIcon from '@/svg/MoreIcon'
import PinIcon from '@/svg/PinIcon'
import ModelPin from '../ModelPin'
import SettingConv from '../SettingConv'

import ArrrowRightIcon from '@/svg/ArrrowRightIcon'
import classes from './InboxChat.module.scss'

const mappingType = {
	MEDIAS: 'Pin a image',
	STICKER: 'Pin a sticker',
}
interface InboxChatProps {
	convId: string
	isNoHeader?: boolean
	type?: 'inbox' | 'chatrom'
	onUpdateListConv?: (id: string, status: boolean) => void
}
const InboxChat = (props: InboxChatProps) => {
	const { convId, isNoHeader, type } = props

	const {
		_scrollRef,
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
		onEnsureMessageLoaded,
		loadingEnsureMessage,
	} = useInboxChat(props)
	const userInChat = useMemo(() => {
		return (members || []).find((i) => i.user_id !== getUserInfo()?.id)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(members)])
	const isDeletedUser = useMemo(() => {
		return !userInChat && type === 'inbox'
	}, [type, userInChat])

	const _renderHeader = () => {
		if (!!isNoHeader) return
		return (
			<Flex className={classes.header}>
				{loadingPage ? (
					<Skeleton.Input className={classes.skeletonHeader} />
				) : (
					<>
						<Flex className={classes.userInChat}>
							<CAvatar src={userInChat?.user?.avatar || ''} />
							<span>{userInChat?.user?.name || 'The user of UniVini'}</span>
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
				{isArray(pinList, 1) && _renderPin()}
				<Flex className={classes.chatBox}>
					<ChatBox
						loadingPage={loadingPage}
						isDisabledChat={isDeletedUser}
						type="inbox"
						itemList={messList}
						loading={loading}
						onLoadMore={onLoadMore}
						_scrollRef={_scrollRef}
						onSendMessage={onSendMessage}
						onActionMessage={onActionMessage}
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
		</div>
	)
}

export default memo(InboxChat)
