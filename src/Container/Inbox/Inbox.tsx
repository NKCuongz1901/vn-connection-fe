'use client'
import useInbox from '@/hooks/Inbox/useInbox'
import React, { memo, useCallback, useMemo } from 'react'

import classes from './Inbox.module.scss'
import { Flex } from 'antd'
import CAvatar from '@/Components/Custom/CAvatar'
import { getUserInfo } from '@/ultis/storage.ults'
import { getDiffFromNow } from '@/ultis/date.ults'
import { mappingTypeMessage } from '@/Variable/common.variable'
import CInput from '@/Components/Custom/CInput'
import { SearchOutlined } from '@ant-design/icons'
import SearchIcon from '@/svg/SearchIcon'
import clsx from 'clsx'
import { onPushState } from '@/ultis/route.ults'
import HangoutChat from '@/Components/Hangout/HangoutChat'
import InboxChat from '@/Components/Inbox/InboxChat'
import { randomString } from '@/ultis/string.ults'

const Inbox = () => {
	const {
		key,
		listConvStranger,
		listConvPersonal,
		convId,
		setConvId,
		onScroll,
	} = useInbox()
	const list = useMemo(
		() => [...listConvPersonal],
		[listConvPersonal, listConvStranger],
	)
	const _renderLastMessage = useCallback((last_message) => {
		const { type, content } = last_message || {}
		switch (type) {
			case 'TEXT':
				return <div className={classes.text}>{content}</div>
			default:
				return <div>{mappingTypeMessage[type] || type}</div>
		}
	}, [])
	const _renderConvItem = useCallback((item) => {
		const meId = getUserInfo()?.id
		const {
			id,
			last_message,
			last_time_chat,
			users_in_conversation: users,
		} = item
		const { read_user_ids, type, content } = last_message || {}
		const isRead = (read_user_ids || []).includes(meId)
		const otherUser = users.find((user) => user?.user?.id !== meId) || {}
		const { avatar, name } = otherUser?.user || {}
		const { value: timeAgo, unit } = getDiffFromNow({
			input: Number(last_time_chat),
		})
		return (
			<Flex
				className={classes.convItem}
				onClick={() => {
					key.current = randomString()
					onPushState({ id })
				}}
			>
				<CAvatar src={avatar} />
				<Flex className={classes.info} vertical>
					<Flex className={classes.infoTop}>
						<div className={clsx(classes.name, { [classes.long]: isRead })}>
							{name}
						</div>
						<Flex className={classes.time}>
							<span>
								{timeAgo} {unit ? unit + 's ago' : ''}
							</span>
							{!isRead && <span className={classes.unread} />}
						</Flex>
					</Flex>
					{_renderLastMessage(last_message)}
				</Flex>
			</Flex>
		)
	}, [])
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container}>
				<Flex className={classes.convContainer} vertical>
					<Flex className={classes.searchBar}>
						<CInput
							prefix={<SearchIcon />}
							placeholder="Search"
							style={{ borderRadius: 40, height: 40 }}
						/>
					</Flex>
					<Flex className={classes.convList} vertical onScroll={onScroll}>
						{list.map((conv) => (
							<Flex key={conv.id} className={classes.convItemWrapper}>
								{_renderConvItem(conv)}
							</Flex>
						))}
					</Flex>
				</Flex>
				<Flex className={classes.chatContainer}>
					{convId && <InboxChat key={key.current} convId={convId} />}
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(Inbox)
