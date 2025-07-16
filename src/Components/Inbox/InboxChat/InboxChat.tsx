import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo, useMemo } from 'react'

import { isArray } from '@/ultis/array.ults'
import { toJson } from '@/ultis/common.ults'
import { onPushState } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import ChatBox from '@/Components/ChatBox'
import CAvatar from '@/Components/Custom/CAvatar'
import useInboxChat from '@/hooks/Inbox/useInboxChat'
import MoreIcon from '@/svg/MoreIcon'
import PinIcon from '@/svg/PinIcon'
import ModelPin from '../ModelPin'
import SettingConv from '../SettingConv'

import classes from './InboxChat.module.scss'

const mappingType = {
	MEDIAS: 'Pin a image',
	STICKER: 'Pin a sticker',
}

const InboxChat = ({ convId }) => {
	const {
		_scrollRef,
		messList,
		members,
		loadingPage,
		loading,
		pinList,
		modal,
		setModal,
		openSetting,
		convInfo,
		setOpenSetting,
		onSendMessage,
		onActionMessage,
		onLoadMore,
		onGetPinMessage,
		onGetListMessById,
		onActionSettingConv,
	} = useInboxChat({ convId })
	const userInChat = useMemo(() => {
		return (members || []).find((i) => i.user_id !== getUserInfo()?.id)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(members)])
	const _renderPin = () => {
		return (
			<Flex
				className={classes.pinMess}
				onClick={() => setModal({ type: 'pin', data: { id: convId } })}
			>
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
							onGetListMessById(true)
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
				<Flex className={classes.header}>
					{loadingPage ? (
						<Skeleton.Input className={classes.skeletonHeader} />
					) : (
						<>
							<Flex className={classes.userInChat}>
								<CAvatar src={userInChat?.user?.avatar || ''} />
								<span>{userInChat?.user?.name}</span>
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
				{isArray(pinList, 1) && _renderPin()}
				<Flex className={classes.chatBox}>
					<ChatBox
						type="inbox"
						itemList={messList}
						loading={loading}
						onLoadMore={onLoadMore}
						_scrollRef={_scrollRef}
						onSendMessage={onSendMessage}
						onActionMessage={onActionMessage}
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
