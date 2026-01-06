import { IconCircleXFilled } from '@tabler/icons-react'
import { Dropdown, Flex, Menu, Skeleton } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { memo, useCallback, useState } from 'react'

import useChatRoomChatBox from '@/hooks/ChatRoomChatBox/useChatRoomChatBox'

import { arrayFrom, isArray } from '@/ultis/array.ults'
import { parseDayFromIsNewDate } from '@/ultis/date.ults'
import { handleParseFileImg, handleParseFileVideo } from '@/ultis/file.utls'
import { useLocalePath } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import CcIcon from '@/svg/CcIcon'
import DotIcon from '@/svg/DotIcon'
import HappyIcon from '@/svg/HappyIcon'
import Heart from '@/svg/Heart'
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
import CInput from '../Custom/CInput'
import CInputTag from '../Custom/CInputTag'
import CLoading from '../Custom/CLoading/CLoading'
import CTextSpecial from '../Custom/CTextSpecial'
import CUploadMuti from '../Custom/CUploadMuti'
import VisualizerWithPlay from '../VisualizerWithPlay'

import { languageOpts, specialTypeMessage } from '@/Variable/common.variable'
import { mainRoutes } from '@/routes/MainRoutes'

import classes from './ChatRoomChatBox.module.scss'
interface ChatRoomChatBoxProps {
	type?: string
	itemList?: any[]
	onLoadMore?: any
	onSendMessage?: any
	_scrollRef?: any
	loading?: boolean
	onActionMessage?: any
	onAddReact?: any
	[key: string]: any
}
const ChatRoomChatBox = (props: ChatRoomChatBoxProps) => {
	const { itemList, onSendMessage, _scrollRef, loading, convId } = props
	const { onChangeRoute } = useLocalePath()
	const {
		listTranslateLoading,
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
		openReact,
		reactList,
		language,
		searchCountry,

		setSearchCountry,
		onStopAudio,

		setReply,
		setOpenReact,
		setIsAudio,
		setText,
		setActiveSticker,
		setShowSticker,
		onScroll,
		onGetMenus,
		onAddSpToText,
		onAddTextToSpeech,
		onAddTranslate,
		onAddReact,
		onOpenReact,
		onChangeLanguage,
	} = useChatRoomChatBox(props)

	const [fileList, setFileList] = useState([])
	const handleImportMedia = async (_values) => {
		const values = []

		for (const i of _values || []) {
			const file = i?.originFileObj
			if (!file) continue

			if (file.type?.startsWith('image')) {
				const { imageUrl } = handleParseFileImg(file)
				if (imageUrl) values.push({ type: 'IMAGE', url: imageUrl, file })
				continue
			}

			if (file.type?.startsWith('video')) {
				const { videoUrl } = await handleParseFileVideo(file)
				if (videoUrl) values.push({ type: 'VIDEO', url: videoUrl, file })
				continue
			}
		}

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
	const _renderReactView = (reactions) => {
		if (!isArray(reactions, 1)) return
		return (
			<Flex className={classes.reactView}>
				{(reactions || []).map((i, index) => {
					const { reaction } = i || {}
					const { image_url } = reaction || {}
					if (index > 2) return
					return (
						<div key={i.id} className={classes.reactViewIcon}>
							<CImage src={image_url} />
						</div>
					)
				})}
				{reactions.length}
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
			parent,
			user,
			user_id,
			isTemp,
			reactions,
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
							<div className={classes.translateWrapper}>
								<Flex vertical className={classes.translateContainer}>
									<div className={classes.translateText}>{trans}</div>
									<Flex className={classes.translateOpt}>
										<span className={classes.translateOptTitle}>
											UniVini AI
										</span>
										<div className={classes.dot}>
											<DotIcon />
										</div>
										<Dropdown
											trigger={['click']}
											onOpenChange={() => {
												setSearchCountry('')
											}}
											dropdownRender={() => (
												<Flex vertical className={classes.wrapperMenuCoutry}>
													<CInput
														placeholder="Search language"
														size="small"
														value={searchCountry}
														onChange={(e) => setSearchCountry(e.target.value)}
														style={{ height: 32 }}
													/>
													<div className={classes.dropdownChangeLanguage}>
														<Menu
															selectedKeys={[language]}
															items={languageOpts
																.filter((i) =>
																	i.searchLabel
																		.toLocaleLowerCase()
																		.includes(
																			searchCountry.toLocaleLowerCase(),
																		),
																)
																.map((i) => ({
																	key: i.lang,
																	label: i.label,
																	onClick: () =>
																		onChangeLanguage({ item, code: i.lang }),
																}))}
														/>
													</div>
												</Flex>
											)}
											disabled={isTemp || isMemberAction}
										>
											<b
												style={{
													color: '#006B35',
													fontSize: 12,
													cursor: 'pointer',
												}}
											>
												Change language
											</b>
										</Dropdown>
									</Flex>
								</Flex>
							</div>
						)}
						{/* {isLast && (
							<div className={classes.time}>
								{created_at ? dayjs(created_at).format('HH:mm') : ''}
							</div>
						)} */}
						{_renderReactView(reactions)}
					</div>
				)
			case 'STICKER':
				return (
					<Flex vertical className={classes.sticker}>
						<CImage src={content} />
						{/* {isLast && (
							<div className={classes.time}>
								{created_at ? dayjs(created_at).format('HH:mm') : ''}
							</div>
						)} */}
						{_renderReactView(reactions)}
					</Flex>
				)
			case 'MEDIAS': {
				let Content = null
				switch (medias?.[0].type) {
					case 'AUDIO':
						Content = (medias || []).map((media, index) => (
							<Flex key={index}>
								<VisualizerWithPlay item={item} src={media.url} />
							</Flex>
						))
						break
					default:
						Content = (medias || []).map((media, index) => {
							const { type } = media || {}
							const isImg = type === 'IMAGE'
							return (
								<Flex className={classes.media} key={index}>
									{isImg ? (
										<CImage preview src={media.url} />
									) : (
										<video controls>
											<source src={media.url} type="video/mp4" />
										</video>
									)}
								</Flex>
							)
						})
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
											{loadingSpToText ? <CLoading /> : <CcIcon />}
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
									<Flex
										className={clsx(classes.moreIcon, {})}
										onClick={() => onOpenReact(item)}
									>
										<Heart />
									</Flex>
								</Flex>
							)}
							<Flex className={classes.mediaContent}>
								{Content}
								{_renderReactView(reactions)}
							</Flex>
						</Flex>
						{!!spToText && <Flex className={classes.spToText}>{spToText}</Flex>}
						{/* {isLast && (
							<div className={classes.time}>
								{created_at ? dayjs(created_at).format('HH:mm') : ''}
							</div>
						)} */}
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
			case 'OPEN_TALKROOM':
				return <></>
			default:
				return <Flex className={classes.memberAccept}>{type}</Flex>
		}
	}
	const _renderReact = (item) => {
		if (item?.id !== openReact?.id) return
		const { reactions } = item || {}
		const reactType = (reactions || []).find(
			(i) => i.user_id === getUserInfo('id'),
		)

		return (
			<Flex className={classes.reactWrapper}>
				{(reactList || []).map((react) => {
					const { id, image_url } = react
					const isActive = reactType?.reaction_id === id
					return (
						<Flex
							key={id}
							className={clsx(classes.reactItem, {
								[classes.activeReact]: isActive,
							})}
							onClick={() =>
								onAddReact({ item, react, type: isActive ? 'remove' : 'add' })
							}
						>
							<div className={classes.reactIcon}>
								<CImage src={image_url} />
							</div>
						</Flex>
					)
				})}
			</Flex>
		)
	}
	const _renderItemChat = ({ item }) => {
		const {
			id,
			user,
			isFirst,
			isLast,
			isNewDate,
			isTemp,
			type,
			user_id,
			reactions,
			created_at,
		} = item || {}

		const isMe = getUserInfo('id') === user_id
		const isMemberAction = specialTypeMessage.includes(type)
		if (isMemberAction) return
		const isNot = isMe || isMemberAction
		const typeMedia = item?.medias?.[0]?.type
		const loadingSpToText = !!listSpToTextLoading[id]

		return (
			<Flex vertical key={id}>
				{isNewDate && (
					<Flex className={classes.date}>
						{parseDayFromIsNewDate(created_at)}
					</Flex>
				)}

				<Flex
					className={clsx(classes.itemChat, {
						[classes.mt2]: isFirst,
						[classes.isMe]: isMe,
						[classes.isLast]: isLast,
						[classes.isCenter]: isMemberAction,
						[classes.isTemp]: isTemp,
					})}
				>
					<Flex className={classes.contentItem}>
						{!isNot && (
							<Flex className={classes.avatar}>
								{isFirst && (
									<CAvatar
										style={{ cursor: 'pointer' }}
										src={user?.avatar}
										onClick={() =>
											onChangeRoute(`${mainRoutes.profile}/${user_id}`)
										}
									/>
								)}
							</Flex>
						)}
						<Flex className={classes.contentInfo} vertical>
							{isFirst && (
								<Flex className={classes.infoNameTime}>
									{!isNot && <Flex className={classes.name}>{user?.name}</Flex>}
									{!isMemberAction && (
										<div className={classes.time}>
											{created_at ? dayjs(created_at).format('HH:mm') : ''}
										</div>
									)}
								</Flex>
							)}
							<Flex
								className={clsx(classes.content, {
									[classes.isReaction]: isArray(reactions, 1),
								})}
							>
								{!(isTemp || isMemberAction) && type !== 'MEDIAS' && (
									<Flex className={classes.moreIconWrapper}>
										{!isMe && typeMedia === 'AUDIO' && (
											<Flex
												className={clsx(classes.moreIcon, {
													[classes.disabled]: loadingSpToText,
												})}
												onClick={() => !loadingSpToText && onAddSpToText(item)}
											>
												{loadingSpToText ? <CLoading /> : <CcIcon />}
											</Flex>
										)}
										{type === 'TEXT' && !isMe && (
											<Flex
												className={clsx(classes.moreIcon, {
													[classes.disabled]: listTranslateLoading[id],
												})}
												onClick={() => onAddTranslate(item)}
											>
												{listTranslateLoading[id] ? (
													<CLoading />
												) : (
													<TranslateIcon />
												)}
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
												{listTextToSpeechLoading[id] ? (
													<CLoading />
												) : (
													<VolumeIcon />
												)}
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
										<Flex
											className={clsx(classes.moreIcon, classes.iconHeart)}
											onClick={() => onOpenReact(item)}
										>
											<Heart />
										</Flex>
									</Flex>
								)}
								{_renderContentChat(item)}
							</Flex>
						</Flex>
					</Flex>
					{_renderReact(item)}
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
		<div
			className={classes.wrapper}
			onClick={() => {
				if (openReact) setOpenReact(false)
			}}
		>
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
			<Flex className={clsx(classes.chatBox)}>
				<Flex className={classes.chooseImg}>
					<Flex className={classes.chooseImgContent}>
						{fileList.map((i) => {
							const { url, type } = i || {}
							const isImg = type === 'IMAGE'
							return (
								<Flex key={url} className={classes.chooseImgItem}>
									{isImg ? (
										<CImage preview={true} src={url} />
									) : (
										<video controls>
											<source src={url} type="video/mp4" />
										</video>
									)}
									<Flex
										className={classes.chooseImgCancel}
										onClick={() =>
											setFileList((prev) =>
												prev.filter((prev) => prev.url !== url),
											)
										}
									>
										<IconCircleXFilled />
									</Flex>
								</Flex>
							)
						})}
					</Flex>
					<CUploadMuti
						fileList={fileList.map((i) => i.file)}
						onChange={({ file: _file, fileList: newList }) => {
							handleImportMedia(newList)
						}}
						accept="image/*,video/*"
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
						if (e.key === 'Enter' && !e.shiftKey) {
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
						className={clsx(classes.micro, { [classes.isAudioMicro]: isAudio })}
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
