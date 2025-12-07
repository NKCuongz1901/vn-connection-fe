import { IconCircleXFilled } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { memo, useCallback, useState } from 'react'

import useChatRoomChatBox from '@/hooks/ChatRoomChatBox/useChatRoomChatBox'

import { arrayFrom, isArray } from '@/ultis/array.ults'
import { handleParseFileImg } from '@/ultis/file.utls'
import { getUserInfo } from '@/ultis/storage.ults'

import CcIcon from '@/svg/CcIcon'
import HappyIcon from '@/svg/HappyIcon'
import ImageIcon from '@/svg/ImageIcon'
import MicroPhoneIcon from '@/svg/MicroPhoneIcon'
import MoreIcon from '@/svg/MoreIcon'
import ReplyIcon from '@/svg/ReplyIcon'
import SendIcon from '@/svg/SendIcon'
import TranslateIcon from '@/svg/TranslateIcon'
import VolumeIcon from '@/svg/VolumeIcon'
import AudioRecorder from '../AudioRecorder'
import CAvatar from '../Custom/CAvatar'
import CImage from '../Custom/CImage'
import CInputTag from '../Custom/CInputTag'
import CTextSpecial from '../Custom/CTextSpecial'
import CUploadMuti from '../Custom/CUploadMuti'
import VisualizerWithPlay from './VisualizerWithPlay'

import { specialTypeMessage } from '@/Variable/common.variable'

import classes from './ChatRoomChatBox.module.scss'
interface ChatRoomChatBoxProps {
	type?: string
	itemList?: any[]
	onLoadMore?: any
	onSendMessage?: any
	_scrollRef?: any
	loading?: boolean
	onActionMessage?: any
	[key: string]: any
}
const ChatRoomChatBox = ({
	type,
	itemList,
	onLoadMore,
	onSendMessage,
	_scrollRef,
	loading,
	onActionMessage,
	convId,
}: ChatRoomChatBoxProps) => {
	const {
		isAudio,
		_refInput,
		activeSticker,
		showSticker,
		stickerList,
		text,
		reply,
		listSpToText,
		listSpToTextLoading,
		listTextToSpeechLoading,
		playAudioId,
		listTranslate,
		onStopAudio,

		setReply,
		setIsAudio,
		setText,
		setActiveSticker,
		setShowSticker,
		onScroll,
		onGetMenus,
		onAddSpToText,
		onAddTextToSpeech,
		onAddTranslate,
	} = useChatRoomChatBox({ onLoadMore, type, onActionMessage })

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
	const _renderContentChat = (item) => {
		const {
			id,
			type,
			content,
			mentions,
			medias,
			isLast,
			created_at,
			parent,
			user,
			user_id,
			isTemp,
		} = item || {}

		const { name } = user || {}
		const spToText = listSpToText[id]
		const trans = listTranslate[id]
		const isMe = getUserInfo('id') === user_id
		const isMemberAction = specialTypeMessage.includes(type)
		const typeMedia = medias?.[0]?.type
		const loadingSpToText = !!listSpToTextLoading[id]
		switch (type) {
			case 'TEXT':
				return (
					<div className={classes.text}>
						{_renderParentItem(parent)}
						<CTextSpecial data={content} mentions={mentions} />
						{trans && (
							<div style={{ fontSize: 10 }}>
								<Flex vertical>
									{trans}
									<div>
										<span>UniVini AI </span>
										<b style={{ color: '#006B35', fontSize: 12 }}>
											Change language
										</b>
									</div>
								</Flex>
							</div>
						)}
						{isLast && (
							<div className={classes.time}>
								{created_at ? dayjs(created_at).format('HH:mm') : ''}
							</div>
						)}
					</div>
				)
			case 'STICKER':
				return (
					<Flex vertical className={classes.sticker}>
						<CImage src={content} />
						{isLast && (
							<div className={classes.time}>
								{created_at ? dayjs(created_at).format('HH:mm') : ''}
							</div>
						)}
					</Flex>
				)
			case 'MEDIAS': {
				let Content = null
				switch (medias?.[0].type) {
					case 'AUDIO':
						Content = (medias || []).map((media, index) => (
							<Flex key={index}>
								<VisualizerWithPlay
									item={item}
									src={media.url}
								></VisualizerWithPlay>
							</Flex>
						))
						break
					default:
						Content = (medias || []).map((media, index) => (
							<Flex className={classes.media} key={index}>
								<CImage src={media.url} />
							</Flex>
						))
				}
				return (
					<Flex className={classes.medias} vertical>
						<Flex>
							{!(isTemp || isMemberAction) && (
								<Flex className={classes.moreIconWrapper}>
									{!isMe && typeMedia === 'AUDIO' && (
										<Flex
											className={clsx(classes.moreIcon, {
												[classes.disabled]: loadingSpToText,
											})}
											onClick={() => !loadingSpToText && onAddSpToText(item)}
										>
											<CcIcon />
										</Flex>
									)}
									<Dropdown
										trigger={['click']}
										menu={{ items: onGetMenus({ item, isMe }) }}
										disabled={isTemp || isMemberAction}
									>
										<Flex className={classes.moreIcon}>
											<MoreIcon />
										</Flex>
									</Dropdown>
								</Flex>
							)}
							{Content}
						</Flex>
						{!!spToText && <Flex className={classes.spToText}>{spToText}</Flex>}
						{isLast && (
							<div className={classes.time}>
								{created_at ? dayjs(created_at).format('HH:mm') : ''}
							</div>
						)}
					</Flex>
				)
			}
			case 'MEMBER_ACCEPT':
			case 'TITLE_CHANGE':
			case 'ADDRESS':
			case 'MEMBER_LEAVE':
				return <Flex className={classes.memberAccept}>{content}</Flex>
			case 'PIN':
			case 'UNPIN':
				return (
					<Flex className={classes.memberAccept}>
						<div className={classes.ellipsisContent}>
							{name} {content}
						</div>
					</Flex>
				)
			case 'MEMBER_JOIN':
			case 'POST':
				return <></>
			default:
				return <Flex className={classes.memberAccept}>{type}</Flex>
		}
	}
	const _renderItemChat = ({ item }) => {
		const { id, user, isFirst, isLast, type, user_id, isTemp } = item || {}

		const isMe = getUserInfo('id') === user_id
		const isMemberAction = specialTypeMessage.includes(type)
		const isNot = isMe || isMemberAction
		const typeMedia = item?.medias?.[0]?.type
		const loadingSpToText = !!listSpToTextLoading[id]

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
							{!(isTemp || isMemberAction) && type !== 'MEDIAS' && (
								<Flex className={classes.moreIconWrapper}>
									{!isMe && typeMedia === 'AUDIO' && (
										<Flex
											className={clsx(classes.moreIcon, {
												[classes.disabled]: loadingSpToText,
											})}
											onClick={() => !loadingSpToText && onAddSpToText(item)}
										>
											<CcIcon />
										</Flex>
									)}
									{type === 'TEXT' && !isMe && (
										<Flex
											className={clsx(classes.moreIcon, {
												[classes.disabled]: loadingSpToText,
											})}
											onClick={() => onAddTranslate(item)}
										>
											<TranslateIcon />
										</Flex>
									)}
									{!isMe && (
										<Flex
											className={clsx(classes.moreIcon, {
												[classes.disabled]: listTextToSpeechLoading[id],
												[classes.isPlaying]: playAudioId === id,
											})}
											onClick={() => {
												if (playAudioId === id) {
													onStopAudio(id)
												} else {
													if (!listTextToSpeechLoading[id]) {
														onAddTextToSpeech(item)
													}
												}
											}}
										>
											<VolumeIcon />
										</Flex>
									)}
									<Dropdown
										trigger={['click']}
										menu={{ items: onGetMenus({ item, isMe }) }}
										disabled={isTemp || isMemberAction}
									>
										<Flex className={classes.moreIcon}>
											<MoreIcon />
										</Flex>
									</Dropdown>
								</Flex>
							)}
							{_renderContentChat(item)}
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
				// onKeyDown={(e) => {
				// 	if (e.key === 'Enter') {
				// 		e.preventDefault()
				// 		if (!!text.trim()) {
				// 			setText('')
				// 			setReply(null)
				// 			onSendMessage({
				// 				type: 'TEXT',
				// 				content: text,
				// 				parent: reply,
				// 			})
				// 		}
				// 	}
				// }}
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
				<CInputTag
					ref={_refInput}
					id={convId}
					allowClear={false}
					value={text}
					style={{ height: 40 }}
					suffix={_renderIconHappy()}
					placeholder="Enter your text ..."
					disabled={fileList?.length > 0}
					onChange={(e) => setText(e.target.value)}
					onSendMessage={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault()
							if (!!text.trim()) {
								setText('')
								setReply(null)
								onSendMessage({
									type: 'TEXT',
									content: text,
									parent: reply,
								})
							}
						}
					}}
				/>

				{text || isArray(fileList, 1) ? (
					<Flex
						className={classes.sendButton}
						onClick={() => {
							if (!!text.trim() || isArray(fileList, 1)) {
								setText('')
								setReply(null)
								onSendMessage({
									type: 'TEXT',
									content: text,
									parent: reply,
									medias: fileList,
								})
								setFileList([])
							}
						}}
					>
						<SendIcon />
					</Flex>
				) : (
					<Flex
						className={classes.micro}
						onClick={() => setIsAudio((prev) => !prev)}
					>
						<MicroPhoneIcon />
					</Flex>
				)}
			</Flex>
			{!(text || isArray(fileList, 1)) && isAudio && (
				<div>
					<AudioRecorder
						onClose={() => setIsAudio(false)}
						onComplete={(e) => {
							onSendMessage({
								type: 'TEXT',
								parent: reply,
								audio: e,
							})
						}}
					/>
				</div>
			)}
			{_renderSticketList()}
		</div>
	)
}

export default memo(ChatRoomChatBox)
