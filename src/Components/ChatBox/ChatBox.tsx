import { IconCircleXFilled } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { memo, useCallback, useState } from 'react'

import useChatBox from '@/hooks/ChatBox/useChatBox'

import { arrayFrom } from '@/ultis/array.ults'
import { handleParseFileImg } from '@/ultis/file.utls'
import { getUserInfo } from '@/ultis/storage.ults'

import HappyIcon from '@/svg/HappyIcon'
import ImageIcon from '@/svg/ImageIcon'
import ReplyIcon from '@/svg/ReplyIcon'
import SendIcon from '@/svg/SendIcon'
import CAvatar from '../Custom/CAvatar'
import CImage from '../Custom/CImage'
import CInput from '../Custom/CInput'
import CUploadMuti from '../Custom/CUploadMuti'

import { specialTypeMessage } from '@/Variable/common.variable'

import classes from './ChatBox.module.scss'
interface ChatBoxProps {
	type?: string
	itemList?: any[]
	onLoadMore?: any
	onSendMessage?: any
	_scrollRef?: any
	loading?: boolean
	onActionMessage?: any
	[key: string]: any
}
const ChatBox = ({
	type,
	itemList,
	onLoadMore,
	onSendMessage,
	_scrollRef,
	loading,
	onActionMessage,
}: ChatBoxProps) => {
	const {
		_refInput,
		activeSticker,
		showSticker,
		stickerList,
		text,
		reply,
		setReply,
		setText,
		setActiveSticker,
		setShowSticker,
		onScroll,
		onGetMenus,
	} = useChatBox({ onLoadMore, type, onActionMessage })
	const [fileList, setFileList] = useState([])
	const hangleImportImg = (_values) => {
		const values: any[] = []
		;(_values || []).forEach((i) => {
			const { imageUrl, file } = handleParseFileImg(i?.originFileObj) || {}
			if (imageUrl) {
				values.push({ imageUrl, file })
			}
		})
		setFileList(values)
	}
	const _renderParentItem = (parent) => {
		const { type, content, user } = parent || {}
		if (!type) return <></>
		let node = <></>
		switch (type) {
			case 'TEXT':
				node = <div>{content}</div>
				break
			case 'STICKER':
				node = <CImage src={content} />
				break
			case 'MEDIAS':
				node = (
					<Flex className={classes.medias} vertical>
						Send a media
					</Flex>
				)
				break
			default:
				break
		}
		return (
			<Flex className={classes.parentItem}>
				<ReplyIcon />
				<Flex className={classes.parentItemInfo} vertical>
					<div className={classes.parentItemName}>{user?.name}</div>
					{node}
				</Flex>
			</Flex>
		)
	}
	const _renderContentChat = ({
		type,
		content,
		medias,
		isLast,
		created_at,
		parent,
		user,
	}) => {
		const { name } = user || {}
		switch (type) {
			case 'TEXT':
				return (
					<div className={classes.text}>
						{_renderParentItem(parent)}
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
			case 'PIN':
			case 'UNPIN':
				return (
					<Flex className={classes.memberAccept}>
						{name} {content}
					</Flex>
				)
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
						<Flex className={classes.content}>
							<Dropdown
								trigger={['click']}
								menu={{ items: onGetMenus({ item, isMe }) }}
								disabled={isTemp || isMemberAction}
							>
								{_renderContentChat(item)}
							</Dropdown>
						</Flex>
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
							onClick={() => {
								setReply(null)
								onSendMessage({
									type: 'STICKER',
									content: sticker.url,
									parent: reply,
								})
							}}
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
	const _renderReply = () => {
		const { type, content, user } = reply || {}
		let node = <></>
		switch (type) {
			case 'TEXT':
				node = (
					<div className={classes.text}>
						<div>{content}</div>
					</div>
				)
				break
			case 'STICKER':
				node = (
					<Flex vertical>
						<CImage src={content} />
					</Flex>
				)
				break
			case 'MEDIAS':
				node = <div>Send a photo</div>
				break
			default:
				break
		}
		return (
			<Flex className={classes.chatReply}>
				<ReplyIcon />
				<Flex className={classes.replyInfo} vertical>
					<div className={classes.replyName}>{user?.name}</div>
					{node}
				</Flex>
				<Flex className={classes.replyCancel} onClick={() => setReply(null)}>
					<IconCircleXFilled />
				</Flex>
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
			{reply && _renderReply()}
			<Flex
				className={clsx(classes.chatBox)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault()
						setText('')
						setReply(null)
						onSendMessage({
							type: 'TEXT',
							content: text,
							parent: reply,
						})
					}
				}}
			>
				<Flex className={classes.chooseImg}>
					<Flex className={classes.chooseImgContent}>
						{fileList.map((i) => (
							<Flex key={i.imageUrl} className={classes.chooseImgItem}>
								<CImage preview={true} src={i.imageUrl} />
								<Flex
									className={classes.chooseImgCancel}
									onClick={() =>
										setFileList((prev) =>
											prev.filter((prev) => prev.imageUrl !== i.imageUrl),
										)
									}
								>
									<IconCircleXFilled />
								</Flex>
							</Flex>
						))}
					</Flex>
					<CUploadMuti
						fileList={fileList.map((i) => i.file)}
						onChange={({ file: _file, fileList: newList }) => {
							hangleImportImg(newList)
						}}
					>
						<ImageIcon />
					</CUploadMuti>
				</Flex>
				<CInput
					allowClear={false}
					value={text}
					style={{ height: 40 }}
					suffix={_renderIconHappy()}
					placeholder="Enter your text ..."
					onChange={(e) => setText(e.target.value)}
					disabled={fileList?.length > 0}
					ref={_refInput}
				/>
				<Flex
					className={classes.sendButton}
					onClick={() => {
						setText('')
						setReply(null)
						onSendMessage({
							type: 'TEXT',
							content: text,
							parent: reply,
							medias: fileList,
						})
						setFileList([])
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
