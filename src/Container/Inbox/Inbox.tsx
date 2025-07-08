'use client'
import { IconChevronLeft, IconCircleXFilled } from '@tabler/icons-react'
import { Flex } from 'antd'
import clsx from 'clsx'
import { memo, useCallback } from 'react'

import useInbox from '@/hooks/Inbox/useInbox'

import { isArray } from '@/ultis/array.ults'
import { toJson } from '@/ultis/common.ults'
import { getDiffFromNow } from '@/ultis/date.ults'
import { onPushState } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'
import { randomString } from '@/ultis/string.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CInput from '@/Components/Custom/CInput'
import InboxChat from '@/Components/Inbox/InboxChat'
import MessageIcon from '@/svg/MessageIcon'
import SearchIcon from '@/svg/SearchIcon'

import { mappingTypeMessage } from '@/Variable/common.variable'

import classes from './Inbox.module.scss'

const Inbox = () => {
	const {
		key,
		listConvStranger,
		listConvPersonal,
		convId,
		enable,
		show,
		setShow,
		setEnable,
		onScroll,
	} = useInbox()

	const _renderLastMessage = useCallback((last_message) => {
		const { type, content } = last_message || {}
		switch (type) {
			case 'TEXT':
			case 'PIN':
			case 'UNPIN':
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
		const { read_user_ids } = last_message || {}
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	const _renderNewMessageRq = useCallback(() => {
		if (!isArray(listConvStranger, 1)) return
		return (
			<Flex className={classes.newRq} onClick={() => setShow(true)}>
				<Flex className={classes.messageIcon}>
					<MessageIcon />
					<div className={classes.count}>{listConvStranger.length || 0}</div>
				</Flex>
				<Flex vertical className={classes.messageTitle}>
					<span className={classes.title}>New message request</span>
					<span>Messages from strangers</span>
				</Flex>
				<Flex className={classes.iconCancelWrapper}>
					<IconCircleXFilled
						className={classes.iconCancel}
						onClick={(e) => {
							e.stopPropagation()
							setEnable(false)
						}}
					/>
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(listConvStranger)])
	const _renderPersonal = () => {
		if (show) return
		return (
			<>
				<Flex className={classes.searchBar}>
					<CInput
						disabled
						prefix={<SearchIcon />}
						placeholder="Search"
						style={{ borderRadius: 40, height: 40 }}
					/>
				</Flex>
				{enable && _renderNewMessageRq()}
				<Flex className={classes.convList} vertical onScroll={onScroll}>
					{listConvPersonal.map((conv) => (
						<Flex key={conv.id} className={classes.convItemWrapper}>
							{_renderConvItem(conv)}
						</Flex>
					))}
				</Flex>
			</>
		)
	}
	const _renderStranger = () => {
		if (!show) return
		return (
			<>
				<Flex className={classes.backButton} onClick={() => setShow(false)}>
					<IconChevronLeft />
					<span>Messages from strangers</span>
				</Flex>
				<Flex className={classes.convList} vertical>
					{listConvStranger.map((conv) => (
						<Flex key={conv.id} className={classes.convItemWrapper}>
							{_renderConvItem(conv)}
						</Flex>
					))}
				</Flex>
			</>
		)
	}
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container}>
				<Flex
					className={clsx(classes.convContainer, {
						[classes.mini]: convId,
					})}
					vertical
				>
					{_renderPersonal()}
					{_renderStranger()}
				</Flex>
				<Flex className={classes.chatContainer}>
					{convId && <InboxChat key={key.current} convId={convId} />}
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(Inbox)
