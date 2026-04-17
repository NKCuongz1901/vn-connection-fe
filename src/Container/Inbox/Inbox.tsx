'use client'
import { IconChevronLeft, IconCircleXFilled } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { Fragment, memo, useCallback } from 'react'

import useInbox from '@/hooks/Inbox/useInbox'

import { arrayFrom, isArray } from '@/ultis/array'
import { toJson } from '@/ultis/common'
import { getDiffFromNow } from '@/ultis/date'
import { onPushState } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'
import { randomString } from '@/ultis/string'

import CAvatar from '@/Components/Custom/CAvatar'
import CInput from '@/Components/Custom/CInput'
import InboxChat from '@/Components/Inbox/InboxChat'
import Message3 from '@/svg/Message3'
import MessageIcon from '@/svg/MessageIcon'
import NotFound from '@/svg/NotFound'
import People from '@/svg/People'
import SearchIcon from '@/svg/SearchIcon'

import { mappingTypeMessage } from '@/Variable/common.variable'

import classes from './Inbox.module.scss'

const Inbox = () => {
	const {
		loadingConv,
		key,
		listConvStranger,
		listConvPersonal,
		convId,
		enable,
		showSearch,
		show,
		keyword,
		listFriend,
		listConv,
		searchType,
		setSearchType,
		setKeyword,
		setShow,
		setEnable,
		onScroll,
		onScrollFriend,
		onScrollConv,
		onCreateConv,
		onUpdateListConv,
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

	const _renderNoResultFound = () => {
		return (
			<Flex className={classes.notFound} vertical>
				<NotFound />
				<div className={classes.title}>No results found</div>
			</Flex>
		)
	}

	const _renderConvItem = (item) => {
		const meId = getUserInfo()?.id
		const {
			id,
			last_message,
			last_time_chat,
			users_in_conversation: users,
			is_read,
			activeItem,
		} = item
		const otherUser = users.find((user) => user?.user?.id !== meId) || {}
		const { avatar, name } = otherUser?.user || { name: 'Deleted account' }
		const { value: timeAgo, unit } = getDiffFromNow({
			input: Number(last_time_chat),
		})
		return (
			<Flex
				className={clsx(classes.convItem)}
				onClick={() => {
					key.current = randomString()
					onPushState({ id })
				}}
			>
				<CAvatar src={avatar} />
				<Flex className={classes.info} vertical>
					<Flex className={classes.infoTop}>
						<div
							className={clsx(classes.name, {
								[classes.long]: !!is_read || !!activeItem,
							})}
						>
							{name}
						</div>
						<Flex className={classes.time}>
							<span>
								{timeAgo} {unit ? unit + 's ago' : ''}
							</span>
							{!is_read && !activeItem && <span className={classes.unread} />}
						</Flex>
					</Flex>
					{_renderLastMessage(last_message)}
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}
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
	const _renderPersonalConv = () => {
		if (showSearch) return

		return (
			<Fragment>
				{enable && _renderNewMessageRq()}
				<Flex className={classes.convList} vertical onScroll={onScroll}>
					{listConvPersonal.map((conv) => (
						<Flex
							key={conv.id}
							className={clsx(classes.convItemWrapper, {
								[classes.activeItem]: conv.id === convId,
							})}
						>
							{_renderConvItem({ ...conv, activeItem: conv.id === convId })}
						</Flex>
					))}
					{loadingConv.personal && (
						<Flex className={classes.skeletonWrapper} vertical>
							{arrayFrom(3).map((_, index) => (
								<Skeleton.Input
									key={index}
									active
									className={classes.skeleton}
								/>
							))}
						</Flex>
					)}
				</Flex>
			</Fragment>
		)
	}
	const _renderListFriend = () => {
		if (searchType !== 'friend') return

		return (
			<Flex vertical className={classes.searchFriend} onScroll={onScrollFriend}>
				{isArray(listFriend, 1) ? (
					listFriend.map((item) => {
						const { id, name, friend_id, friend } = item || {}
						const { avatar } = friend || {}
						return (
							<Flex
								key={id}
								className={classes.friend}
								onClick={() => onCreateConv(friend_id)}
							>
								<CAvatar src={avatar} className={classes.friendAvatar} />
								<div className={classes.friendName}>{name}</div>
							</Flex>
						)
					})
				) : loadingConv.friend ? (
					<></>
				) : (
					_renderNoResultFound()
				)}
				{loadingConv.friend && (
					<Flex className={classes.skeletonWrapper} vertical>
						{arrayFrom(3).map((_, index) => (
							<Skeleton.Input key={index} active className={classes.skeleton} />
						))}
					</Flex>
				)}
			</Flex>
		)
	}
	const _renderListConv = () => {
		if (searchType !== 'conv') return

		return (
			<Flex vertical className={classes.searchFriend} onScroll={onScrollConv}>
				{isArray(listConv, 1) ? (
					listConv.map((conv) => (
						<Flex
							key={conv.id}
							className={clsx(classes.convItemWrapper, {
								[classes.activeItem]: conv.id === convId,
							})}
						>
							{_renderConvItem({ ...conv, activeItem: conv.id === convId })}
						</Flex>
					))
				) : loadingConv.conv ? (
					<></>
				) : (
					_renderNoResultFound()
				)}
				{loadingConv.conv && (
					<Flex className={classes.skeletonWrapper} vertical>
						{arrayFrom(3).map((_, index) => (
							<Skeleton.Input key={index} active className={classes.skeleton} />
						))}
					</Flex>
				)}
			</Flex>
		)
	}
	const _renderSearch = () => {
		if (!showSearch) return
		return (
			<Flex className={classes.searchContainer} vertical>
				<Flex className={classes.searchTypes}>
					<Flex
						className={clsx(classes.searchType, {
							[classes.searchTypeActive]: searchType === 'conv',
						})}
						onClick={() => setSearchType('conv')}
					>
						<Message3 fill={searchType === 'conv' ? '#006b35' : '#94A3B8'} />
						<span>Messages</span>
					</Flex>
					<Flex
						className={clsx(classes.searchType, {
							[classes.searchTypeActive]: searchType === 'friend',
						})}
						onClick={() => setSearchType('friend')}
					>
						<People fill={searchType === 'friend' ? '#006b35' : '#94A3B8'} />
						<span>Contact</span>
					</Flex>
				</Flex>
				<Flex className={classes.searchBody} vertical>
					{_renderListFriend()}
					{_renderListConv()}
				</Flex>
			</Flex>
		)
	}
	const _renderPersonal = () => {
		if (show) return
		return (
			<>
				<Flex className={classes.searchBar}>
					<CInput
						value={keyword}
						prefix={<SearchIcon />}
						placeholder="Search"
						style={{ borderRadius: 40, height: 40 }}
						onChange={(e) => setKeyword(e.target.value)}
					/>
				</Flex>
				{_renderPersonalConv()}
				{_renderSearch()}
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
						<Flex
							key={conv.id}
							className={clsx(classes.convItemWrapper, {
								[classes.activeItem]: conv.id === convId,
							})}
						>
							{_renderConvItem({ ...conv, activeItem: conv.id === convId })}
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
					{convId && (
						<InboxChat
							key={key.current}
							convId={convId}
							type="inbox"
							onUpdateListConv={onUpdateListConv}
						/>
					)}
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(Inbox)
