import React, { memo, useMemo } from 'react'
import classes from './InboxChat.module.scss'
import { Dropdown, Flex } from 'antd'
import MoreIcon from '@/svg/MoreIcon'
import { onPushState } from '@/ultis/route.ults'
import useInboxChat from '@/hooks/Inbox/useInboxChat'
import ChatBox from '@/Components/ChatBox'
import { randomString } from '@/ultis/string.ults'
import { toJson } from '@/ultis/common.ults'
import { getUserInfo } from '@/ultis/storage.ults'
import CAvatar from '@/Components/Custom/CAvatar'
const InboxChat = ({ convId }) => {
	const {
		_scrollRef,
		messList,
		members,
		convInfo,
		loadingPage,
		loading,
		onSendMessage,
		onLoadMore,
		handleSocket,
	} = useInboxChat({ convId })
	const userInChat = useMemo(() => {
		return (members || []).find((i) => i.user_id !== getUserInfo()?.id)
	}, [toJson(members)])
	return (
		<div className={classes.InboxChatWrapper}>
			<Flex className={classes.chatContainer} vertical>
				<Flex className={classes.header}>
					<Flex className={classes.userInChat}>
						<CAvatar src={userInChat?.user?.avatar || ''} />
						<span>{userInChat?.user?.name}</span>
					</Flex>
					<Flex className={classes.action}>
						<Flex className={classes.iconMore}>
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
				</Flex>
				<Flex className={classes.pinMess} onClick={() => handleSocket()}>
					pin mess
				</Flex>
				<Flex className={classes.chatBox}>
					<ChatBox
						itemList={messList}
						loading={loading}
						onLoadMore={onLoadMore}
						_scrollRef={_scrollRef}
						onSendMessage={onSendMessage}
					/>
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(InboxChat)
