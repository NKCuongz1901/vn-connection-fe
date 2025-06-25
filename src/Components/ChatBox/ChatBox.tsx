import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { memo, useCallback } from 'react'

import useChatBox from '@/hooks/ChatBox/useChatBox'

import { arrayFrom } from '@/ultis/array.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import HappyIcon from '@/svg/HappyIcon'
import ImageIcon from '@/svg/ImageIcon'
import SendIcon from '@/svg/SendIcon'
import CAvatar from '../Custom/CAvatar'
import CImage from '../Custom/CImage'
import CInput from '../Custom/CInput'

import { specialTypeMessage } from '@/Variable/common.variable'

import classes from './ChatBox.module.scss'

const ChatBox = ({
	itemList,
	onLoadMore,
	onSendMessage,
	_scrollRef,
	loading,
}) => {
	const {
		activeSticker,
		showSticker,
		stickerList,
		text,
		setText,
		setActiveSticker,
		setShowSticker,
		onScroll,
	} = useChatBox({ onLoadMore })
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
			case 'MEMBER_LEAVE':
				return <Flex className={classes.memberAccept}>{content}</Flex>
			default:
				return <Flex className={classes.memberAccept}>{type}</Flex>
		}
	}
	const _renderItemChat = ({ item }) => {
		const { id, user, isFirst, isLast, type, user_id, isTemp } = item || {}
		const isMe = getUserInfo('id') === user_id
		const isMemberAction = specialTypeMessage.includes(type)
		const isNot = isMe || isMemberAction
		return (
			<Flex
				className={clsx(classes.itemChat, {
					[classes.mt2]: isFirst,
					[classes.isMe]: isMe,
					[classes.isLast]: isLast,
					[classes.isCenter]: isMemberAction,
					[classes.isTemp]: isTemp,
				})}
				key={id}
			>
				<Flex className={classes.contentItem}>
					{!isNot && (
						<Flex className={classes.avatar}>
							{isFirst && <CAvatar src={user?.avatar} />}
						</Flex>
					)}
					<Flex className={classes.contentInfo} vertical>
						{isFirst && !isNot && (
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
	return (
		<div className={classes.wrapper}>
			<Flex
				className={classes.chatContent}
				vertical
				onScroll={(e) => onScroll(e)}
				ref={_scrollRef}
			>
				{(itemList || []).map((item) => _renderItemChat({ item }))}
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
						setText('')
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
					onClick={() => {
						setText('')
						onSendMessage({ type: 'TEXT', content: text })
					}}
				>
					<SendIcon />
				</Flex>
			</Flex>
			{_renderSticketList()}
		</div>
	)
}

export default memo(ChatBox)
