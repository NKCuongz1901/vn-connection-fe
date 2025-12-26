'use client'

import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import { arrayFrom, isArray } from '@/ultis/array.ults'
import { onPushState, useLocalePath, useSafeBack } from '@/ultis/route.ults'

import ModalUpdateProfile from '@/Components/ChatRoom/ModalUpdateProfile'
import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import useChatRoom from '@/hooks/ChatRoom/useChatRoom'
import ArrrowLeftIcon from '@/svg/ArrrowLeftIcon'
import TickIcon from '@/svg/TickIcon'
import DetailChatRoom from './DetailChatRoom'

import { LEFT_FLAG } from '@/Variable/countryVariable'
import { mainRoutes } from '@/routes/MainRoutes'

import classes from './ChatRoom.module.scss'

const tabOpts = [
	{ value: 'language', label: 'Language' },
	{ value: 'location', label: 'Location' },
]

const ChatRoom = () => {
	const { goBackOrPush } = useSafeBack()
	const { onChangeRoute } = useLocalePath()
	const {
		openModal,
		loading,
		isChatRoomDetail,
		id,
		tab,
		listChatRoom,
		setTab,
		onSuccess,
		setOpenModal,
	} = useChatRoom({
		tabOpts,
	})
	const _renderBack = () => {
		if (isChatRoomDetail) return
		return (
			<Flex className={classes.title} onClick={() => goBackOrPush()}>
				<ArrrowLeftIcon />
				<span>All chat rooms</span>
			</Flex>
		)
	}
	const _renderBody = () => {
		return (
			<Flex className={classes.body} vertical>
				{!isChatRoomDetail && (
					<Flex className={classes.tabs}>
						{tabOpts.map((i) => (
							<div key={i.value} className={classes.btnTab}>
								<CButton
									ctype={i.value === tab ? 'success' : 'disabled'}
									onClick={() => setTab(i.value)}
								>
									{i.label}
								</CButton>
							</div>
						))}
					</Flex>
				)}
				{_renderContentTab()}
			</Flex>
		)
	}
	const _renderTabLanguage = () => {
		if (loading.chatroom)
			return (
				<Flex
					className={clsx(classes.tabLanguage, {
						[classes.inboxDetail]: isChatRoomDetail,
					})}
				>
					{arrayFrom(10).map((_, index) => (
						<Flex key={index} vertical className={classes.chatRoomWrapper}>
							<Skeleton.Avatar active className={classes.contentSkeletonAva} />
							<Skeleton.Input active className={classes.contentSkeletonInput} />
							<Skeleton.Input
								active
								className={classes.contentSkeletonInput2}
							/>
							<Skeleton.Input
								active
								className={classes.contentSkeletonInput3}
							/>
						</Flex>
					))}
				</Flex>
			)
		return (
			<Flex
				className={clsx(classes.tabLanguage, {
					[classes.inboxDetail]: isChatRoomDetail,
				})}
			>
				{listChatRoom.map((room) => {
					const {
						id: _id,
						title,
						amount_of_user,
						amount_of_user_online,
						avatar,
						users_in_conversation,
					} = room || {}
					return (
						<Flex
							key={_id}
							vertical
							className={clsx(classes.chatRoomWrapper, {
								[classes.chatRoomWrapperActive]: id === _id,
							})}
							onClick={() => onPushState({ type: 'language', id: _id })}
						>
							<CAvatar
								src={avatar}
								className={clsx(classes.chatRoomAva, {
									[classes.leftFlag]: !!LEFT_FLAG[title],
								})}
							/>
							<div className={classes.chatRoomTitle}>{title}</div>
							<Flex className={classes.totalMem}>
								{!!isArray(users_in_conversation, 1) && <TickIcon />}
								<div>{amount_of_user} members</div>
							</Flex>
							<Flex className={classes.totalOnl}>
								<div className={classes.online} />
								<div>{amount_of_user_online} users online</div>
							</Flex>
						</Flex>
					)
				})}
			</Flex>
		)
	}
	const _renderContentTab = () => {
		switch (tab) {
			case tabOpts[0].value:
				return (
					<Flex className={classes.languageWrapper}>
						{_renderTabLanguage()}
						{isChatRoomDetail && (
							<Flex className={classes.detailChatRoom}>
								<DetailChatRoom id={id} onSuccess={onSuccess} />
							</Flex>
						)}
					</Flex>
				)
			case tabOpts[1].value:
				return (
					<Flex className={classes.develop}>Feature is in development</Flex>
				)
			default:
				return <></>
		}
	}
	return (
		<div className={classes.wrapper}>
			<Flex
				className={clsx(classes.container, {
					[classes.containerChatDetail]: isChatRoomDetail,
				})}
				vertical
			>
				{_renderBack()}
				{_renderBody()}
				{openModal && (
					<ModalUpdateProfile
						open
						onClose={() => setOpenModal(false)}
						onSubmit={() =>
							onChangeRoute(
								`${mainRoutes.profile}?redirect=${mainRoutes.chatRoom}`,
							)
						}
					/>
				)}
			</Flex>
		</div>
	)
}

export default memo(ChatRoom)
