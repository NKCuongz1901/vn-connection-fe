import { Dropdown, Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import Link from 'next/link'
import { memo, useCallback } from 'react'

import { arrayFrom } from '@/ultis/array.ults'
import { onPushState, useLocalePath } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CImage from '@/Components/Custom/CImage'
import CInput from '@/Components/Custom/CInput'
import useHangoutChat from '@/hooks/Hangout/useHangoutChat'
import { mainRoutes } from '@/routes/MainRoutes'
import HappyIcon from '@/svg/HappyIcon'
import ImageIcon from '@/svg/ImageIcon'
import MoreIcon from '@/svg/MoreIcon'
import SendIcon from '@/svg/SendIcon'
import ModelChooseHangout from '../ModelChooseHangout'

import classes from './HangoutChat.module.scss'

const HangoutChat = ({ postId }) => {
	const { onGetPath } = useLocalePath()

	const {
		_scrollRef,
		commentList,
		hangoutInfo,
		activeSticker,
		showSticker,
		stickerList,
		loadingPage,
		loading,
		text,
		menus,
		modal,
		setModal,
		setText,
		setActiveSticker,
		setShowSticker,
		onSendMessage,
		onScroll,
		onChangeTitleHangout,
	} = useHangoutChat({ postId })
	console.log('🏖️🏖️🏖️ TrieuNinhHan ~ :40 ~ HangoutChat ~ menus:', menus)

	const _renderContentChat = ({
		type,
		content,
		medias,
		isLast,
		created_at,
	}) => {
		switch (type) {
			case 'TEXT':
				return (
					<div className={classes.text}>
						<div>{content}</div>
						{isLast && (
							<div className={classes.time}>
								{created_at ? dayjs(created_at).format('HH:mm') : ''}
							</div>
						)}
					</div>
				)
			case 'STICKER':
				return (
					<Flex vertical>
						<CImage src={content} />
						{isLast && (
							<div className={classes.time}>
								{created_at ? dayjs(created_at).format('HH:mm') : ''}
							</div>
						)}
					</Flex>
				)
			case 'MEDIAS':
				return (
					<Flex className={classes.medias} vertical>
						{(medias || []).map((media, index) => (
							<Flex className={classes.media} key={index}>
								<CImage src={media.url} />
							</Flex>
						))}
						{isLast && (
							<div className={classes.time}>
								{created_at ? dayjs(created_at).format('HH:mm') : ''}
							</div>
						)}
					</Flex>
				)
			case 'MEMBER_ACCEPT':
			case 'TITLE_CHANGE':
			case 'ADDRESS':
				return <Flex className={classes.memberAccept}>{content}</Flex>
			default:
				return <Flex className={classes.memberAccept}>{type}</Flex>
		}
	}
	const _renderItemChat = ({ item }) => {
		const { id, user, isFirst, isLast, type, user_id, isTemp } = item || {}
		const isMe = getUserInfo('id') === user_id
		const isMemberAction = [
			'MEMBER_ACCEPT',
			'TITLE_CHANGE',
			'ADDRESS',
		].includes(type)
		const isNot = isMe || isMemberAction
		return (
			<Flex
				className={clsx(classes.itemChat, {
					[classes.mt2]: !isFirst,
					[classes.isMe]: isMe,
					[classes.isLast]: isLast,
					[classes.isLast]: isLast,
					[classes.isCenter]: isMemberAction,
					[classes.isTemp]: isTemp,
				})}
				key={id}
			>
				<Flex className={classes.contentItem}>
					{!isNot && (
						<Flex className={classes.avatar}>
							{!isFirst && <CAvatar src={user?.avatar} />}
						</Flex>
					)}
					<Flex className={classes.contentInfo} vertical>
						{!isFirst && !isNot && (
							<Flex className={classes.name}>{user?.name}</Flex>
						)}
						<Flex className={classes.content}>{_renderContentChat(item)}</Flex>
					</Flex>
				</Flex>
			</Flex>
		)
	}
	const _renderSticketList = useCallback(() => {
		const contentSticker =
			(stickerList[activeSticker] || stickerList[0])?.sticker_items || []
		return (
			<Flex
				vertical
				className={clsx(classes.chatBoxSticket, {
					[classes.showSticker]: showSticker,
				})}
			>
				<Flex className={classes.stickerTitle}>
					{stickerList.map((item: any, index: number) => (
						<div
							key={item?.title}
							className={clsx(classes.stickerItemTitle, {
								[classes.stickerActive]: activeSticker === index,
							})}
							onClick={() => setActiveSticker(index)}
						>
							<CImage src={item?.sticker_items?.[0]?.url} />
						</div>
					))}
				</Flex>
				<Flex className={classes.contentSticker}>
					{contentSticker.map((sticker) => (
						<div
							key={sticker.url}
							className={classes.stickerItem}
							onClick={() =>
								onSendMessage({ type: 'STICKER', content: sticker.url })
							}
						>
							<CImage src={sticker.url} />
						</div>
					))}
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeSticker, showSticker, stickerList])
	const _renderIconHappy = () => {
		return (
			<Flex
				className={classes.iconHappi}
				onClick={() => setShowSticker((pre) => !pre)}
			>
				<HappyIcon />
			</Flex>
		)
	}
	if (loadingPage) {
		return (
			<div className={classes.hangoutChatWrapper}>
				<Flex className={classes.chatContainer} vertical>
					<Flex className={classes.title}>
						<Skeleton.Input active className={classes.skeleton} />
					</Flex>
					<Flex className={classes.title}>
						<Skeleton.Input active className={classes.skeleton} />
					</Flex>
					<Flex className={classes.chatContent} vertical>
						<Skeleton.Input active className={classes.skeleton} />
					</Flex>
				</Flex>
			</div>
		)
	}
	const _renderModal = () => {
		const { type, data } = modal || {}
		let content = <></>
		switch (type) {
			case 'choose':
				content = (
					<ModelChooseHangout
						data={data || ''}
						onClose={() => setModal(null)}
						onSubmit={onChangeTitleHangout}
					/>
				)
				break
			default:
				break
		}
		return content
	}
	return (
		<div className={classes.hangoutChatWrapper}>
			<Flex className={classes.chatContainer} vertical>
				<Flex className={classes.header}>
					<div>{hangoutInfo?.title}</div>
					<Flex className={classes.action}>
						<Dropdown menu={{ items: menus }} trigger={['click']}>
							<Flex className={classes.iconMore}>
								<MoreIcon />
							</Flex>
						</Dropdown>
						<Flex className={classes.iconClose} onClick={() => onPushState({})}>
							X
						</Flex>
					</Flex>
				</Flex>
				<Flex className={classes.title}>
					{hangoutInfo?.participants?.map((item) => (
						<Link
							key={item?.id}
							href={onGetPath(`${mainRoutes.profile}/${item?.user_id}`)}
							target="_blank"
						>
							<CAvatar key={item?.id} src={item?.user?.avatar} />
						</Link>
					))}
				</Flex>
				<Flex
					className={classes.chatContent}
					vertical
					onScroll={(e) => onScroll(e)}
					ref={_scrollRef}
				>
					{(commentList || []).map((item) => _renderItemChat({ item }))}
					{loading &&
						arrayFrom(3).map((_, index) => (
							<Flex key={index} className={classes.skeletonWrapper}>
								<Skeleton.Input active className={classes.skeleton} />
							</Flex>
						))}
				</Flex>
				<Flex
					className={clsx(classes.chatBox)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault()
							onSendMessage({ type: 'TEXT', content: text })
						}
					}}
				>
					<Flex className={classes.chooseImg}>
						<ImageIcon />
					</Flex>
					<CInput
						allowClear={false}
						value={text}
						style={{ height: 40 }}
						suffix={_renderIconHappy()}
						placeholder="Enter your text ..."
						onChange={(e) => setText(e.target.value)}
					/>
					<Flex
						className={classes.sendButton}
						onClick={() => onSendMessage({ type: 'TEXT', content: text })}
					>
						<SendIcon />
					</Flex>
				</Flex>
				{_renderSticketList()}
				{_renderModal()}
			</Flex>
		</div>
	)
}

export default memo(HangoutChat)
