'use client'
import { IconCircleXFilled } from '@tabler/icons-react'
import { Dropdown, Flex, Menu, Skeleton } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import {
	memo,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'

import useChatBox from '@/hooks/ChatBox/useChatBox'
import { useModal } from '@/context/ModalContext'

import { arrayFrom, isArray } from '@/ultis/array'
import { isMobile } from '@/ultis/common'
import { parseDayFromIsNewDate } from '@/ultis/date'
import { isImageOnlyMediaMessage } from '@/ultis/chatMedia'
import {
	handleParseFileImg,
	handleParseFileVideo,
	mergeChatMediaFileList,
} from '@/ultis/file'
import { getUserInfo } from '@/ultis/storage'

import QuickMessageModal from '@/Components/Modal/QuickMesageModal/QuickMessageModal'
import { mapQuickMessageToSendMedias } from '@/Components/Modal/QuickMesageModal/quickMessageUtils'
import { QuickMessageItem } from '@/hooks/QuickMesage/useQuickMessage'
import HappyIcon from '@/svg/HappyIcon'
import ImageIcon from '@/svg/ImageIcon'
import ReplyIcon from '@/svg/ReplyIcon'
import SendIcon from '@/svg/SendIcon'
import MiniApp from '@/svg/MiniApp'
import CAvatar from '../Custom/CAvatar'
import CImage from '../Custom/CImage'
import CInputTag from '../Custom/CInputTag'
import CLoading from '../Custom/CLoading/CLoading'
import CTextSpecial from '../Custom/CTextSpecial'
import CUploadMuti from '../Custom/CUploadMuti'

import {
	ACTION_ITEMS,
	languageOpts,
	specialTypeMessage,
} from '@/Variable/common.variable'

import { MessageActionMenuItem } from './MessageActionPopover'
import MessageActionFloatingPopover from './MessageActionFloatingPopover'
import classes from './ChatBox.module.scss'
import MicroPhoneIcon from '@/svg/MicroPhoneIcon'
import AudioRecorder from '../AudioRecorder'
import DotIcon from '@/svg/DotIcon'
import CInput from '../Custom/CInput'
import VisualizerWithPlay from '../VisualizerWithPlay'
import CcIcon from '@/svg/CcIcon'
import TranslateIcon from '@/svg/TranslateIcon'
import VolumeIcon from '@/svg/VolumeIcon'

interface ChatBoxProps {
	isDisabledChat?: boolean
	loadingPage?: boolean
	type?: string
	itemList?: any[]
	onLoadMore?: any
	onSendMessage?: any
	onAddReact?: any
	_scrollRef?: any
	loading?: boolean
	onActionMessage?: any
	onEnsureMessageLoaded?: (id: string) => Promise<boolean>
	loadingEnsureMessage?: boolean
	convId?: string
	mentionData?: { id: string; display: string; avatar?: string }[]
	editingMessage?: any
	onEditMessage?: (payload: {
		message: any
		content?: string
		medias?: any[]
	}) => void
	onCancelEdit?: () => void
	onAvatarClick?: (userId: string) => void
	[key: string]: any
}

const mapMessageMediasToFileList = (medias: any[] = []) =>
	(medias || []).map((m) => ({
		type: m?.type || 'IMAGE',
		url: m?.url,
		isExisting: true,
		fileName: m?.fileName,
		width: m?.width,
		height: m?.height,
		ratio: m?.ratio,
		thumbnail: m?.thumbnail,
		duration: m?.duration,
	}))

const ChatBox = ({
	isDisabledChat,
	loadingPage,
	type,
	itemList,
	onLoadMore,
	onSendMessage,
	onAddReact,
	_scrollRef,
	loading,
	onActionMessage,
	onEnsureMessageLoaded,
	loadingEnsureMessage,
	convId,
	mentionData,
	editingMessage,
	onEditMessage,
	onCancelEdit,
	onAvatarClick,
}: ChatBoxProps) => {
	const { openConfirm, closeModal } = useModal()
	const cancelEditRef = useRef<() => void>(() => {})
	const [fileList, setFileList] = useState([])
	const [openQuickMessage, setOpenQuickMessage] = useState(false)
	const messageRefs = useRef<Record<string, HTMLDivElement | null>>({})
	const [jumpHighlightId, setJumpHighlightId] = useState('')
	const [pendingScroll, setPendingScroll] = useState<{
		id: string
		attempt: number
	} | null>(null)
	const isJumpingRef = useRef(false)

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
		showActionMenu,
		setSearchCountry,
		onStopAudio,

		setReply,
		setOpenReact,
		setIsAudio,
		setText,
		setActiveSticker,
		setShowSticker,
		setShowActionMenu,
		onScroll,
		onGetMenus,
		onAddSpToText,
		onAddTextToSpeech,
		onAddTranslate,
		onAddReact: onActionReact,
		onOpenReact,
		onChangeLanguage,
	} = useChatBox({
		onLoadMore,
		type,
		onActionMessage,
		onAddReact,
		onCancelEdit: () => cancelEditRef.current(),
	})

	const handleCancelEditMode = useCallback(() => {
		setText('')
		setFileList([])
		setReply(null)
		onCancelEdit?.()
	}, [onCancelEdit, setReply, setText])

	cancelEditRef.current = handleCancelEditMode

	const notifyMediaLimit = useCallback(() => {
		openConfirm({
			message: 'You can only upload up to 5 medias',
			onAccept: () => closeModal(),
		})
	}, [closeModal, openConfirm])

	useEffect(() => {
		if (!editingMessage) return
		setText(editingMessage.content || '')
		setReply(null)
		setFileList(mapMessageMediasToFileList(editingMessage.medias))
		_refInput?.current?.focus()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editingMessage?.id])

	const handleSubmitMessage = () => {
		if (!(!!text.trim() || isArray(fileList, 1))) return

		if (editingMessage && onEditMessage) {
			onEditMessage({
				message: editingMessage,
				content: text,
				medias: fileList,
			})
			setText('')
			setFileList([])
			setReply(null)
			return
		}

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

	const handleEnsureMessageLoaded = async (parentId?: string) => {
		if (!parentId || isJumpingRef.current) return
		isJumpingRef.current = true
		try {
			let canScroll = !!messageRefs.current[parentId]
			if (!canScroll && onEnsureMessageLoaded) {
				canScroll = await onEnsureMessageLoaded(parentId)
			}
			if (!canScroll) return
			setPendingScroll({ id: parentId, attempt: 0 })
		} finally {
			isJumpingRef.current = false
		}
	}

	useLayoutEffect(() => {
		if (!pendingScroll) return
		const { id, attempt } = pendingScroll
		const targetEl = messageRefs.current[id]

		if (!targetEl) {
			if (attempt >= 20) {
				setPendingScroll(null)
				return
			}
			const t = setTimeout(() => {
				setPendingScroll((prev) =>
					prev ? { ...prev, attempt: prev.attempt + 1 } : prev,
				)
			}, 30)
			return () => clearTimeout(t)
		}

		targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
		setJumpHighlightId(id)
		const timeoutId = setTimeout(() => setJumpHighlightId(''), 1500)
		setPendingScroll(null)
		return () => clearTimeout(timeoutId)
	}, [pendingScroll, itemList])

	const hangleImportImg = async (_values) => {
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

		setFileList((prev) => {
			const { next, limitExceeded } = mergeChatMediaFileList(
				prev,
				values,
				!!editingMessage,
			)
			if (limitExceeded) notifyMediaLimit()
			return next
		})
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
			case 'MEDIAS': {
				const trimmed = String(content ?? '').trim()
				node = trimmed ? (
					<div className={classes.parentQuotedText}>
						<CTextSpecial data={content} mentions={parent?.mentions} />
					</div>
				) : (
					<div>Send a media</div>
				)
				break
			}
			default:
				break
		}

		return (
			<Flex
				className={clsx(classes.parentItem, {
					[classes.parentItemDisabled]: loadingEnsureMessage,
				})}
				onClick={(e) => {
					e.stopPropagation()
					if (loadingEnsureMessage) return
					handleEnsureMessageLoaded(parent?.id)
				}}
				style={{
					cursor: loadingEnsureMessage
						? 'wait'
						: parent?.id
							? 'pointer'
							: 'default',
				}}
			>
				{loadingEnsureMessage ? <CLoading /> : <ReplyIcon />}
				<Flex className={classes.parentItemInfo} vertical>
					<div className={classes.parentItemName}>{user?.name}</div>
					{node}
				</Flex>
			</Flex>
		)
	}

	const _renderMessageTime = (
		created_at?: string,
		edited_at?: string | null,
	) => (
		<div className={classes.time}>
			{edited_at ? <span className={classes.editedLabel}>Edited</span> : null}
			<span>{created_at ? dayjs(created_at).format('HH:mm') : ''}</span>
		</div>
	)

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
			created_at,
			edited_at,
		} = item || {}

		const { name } = user || {}
		const spToText = listSpToText[id]
		const trans = listTranslate[id]
		const isMe = getUserInfo('id') === user_id
		const isMemberAction = specialTypeMessage.includes(type)

		switch (type) {
			case 'TEXT':
				return (
					<div className={classes.text}>
						{_renderParentItem(parent)}
						<CTextSpecial data={content} mentions={mentions} />
						{trans && (
							<div
								className={classes.translateWrapper}
								onClick={(e) => e.stopPropagation()}
							>
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
						{_renderMessageTime(created_at, edited_at)}
						{_renderReactView(reactions)}
					</div>
				)

			case 'STICKER':
				return (
					<Flex vertical className={classes.stickerWrapper}>
						{_renderParentItem(parent)}
						<Flex vertical className={classes.sticker}>
							<CImage src={content} />
							{_renderReactView(reactions)}
						</Flex>
						{_renderMessageTime(created_at, edited_at)}
					</Flex>
				)

			case 'MEDIAS': {
				const totalMedia = (medias || []).length
				const gridCount = Math.min(totalMedia, 5)
				const firstMediaType = medias?.[0]?.type
				const isAudioMedia = firstMediaType === 'AUDIO'
				let Content = null

				switch (firstMediaType) {
					case 'AUDIO':
						Content = (medias || []).map((media, index) => (
							<Flex key={index}>
								<VisualizerWithPlay item={item} src={media.url} />
							</Flex>
						))
						break

					default:
						Content = (medias || []).slice(0, 5).map((media, index) => {
							const { type } = media || {}
							const isImg = type === 'IMAGE'
							const isOverflow = index === 4 && totalMedia > 5
							return (
								<Flex className={classes.media} key={index}>
									{isImg ? (
										<div onClick={(e) => e.stopPropagation()}>
											<CImage preview src={media.url} />
										</div>
									) : (
										<video controls>
											<source src={media.url} type="video/mp4" />
										</video>
									)}
									{isOverflow && (
										<div className={classes.moreOverlay}>+{totalMedia - 5}</div>
									)}
								</Flex>
							)
						})
				}

				return (
					<Flex className={classes.medias} vertical>
						<Flex>
							{!(isTemp || isMemberAction) && isAudioMedia && !isMe && (
								<Flex
									className={classes.moreIconWrapper}
									onClick={(e) => e.stopPropagation()}
								>
									<Flex
										className={clsx(classes.moreIcon, {
											[classes.disabled]: listSpToTextLoading[id],
										})}
										onClick={() =>
											!listSpToTextLoading[id] && onAddSpToText(item)
										}
									>
										{listSpToTextLoading[id] ? <CLoading /> : <CcIcon />}
									</Flex>
								</Flex>
							)}
							<Flex className={classes.mediasWrapper}>
								{_renderParentItem(parent)}
								<div
									className={clsx(
										isAudioMedia
											? classes.mediaContent
											: classes.multiMediaContent,
										!isAudioMedia && classes[`grid${gridCount}`],
									)}
								>
									{Content}
								</div>
								{!!String(content || '').trim() && !isAudioMedia && (
									<div
										className={classes.mediaCaption}
										onClick={
											isImageOnlyMediaMessage(item)
												? (e) => {
														if (isTemp || isMemberAction) return
														e.stopPropagation()
														onOpenReact(item, e)
													}
												: undefined
										}
									>
										<CTextSpecial data={content} mentions={mentions} />
									</div>
								)}
								{_renderReactView(reactions)}
							</Flex>
						</Flex>
						{!!spToText && <Flex className={classes.spToText}>{spToText}</Flex>}
						{_renderMessageTime(created_at, edited_at)}
					</Flex>
				)
			}

			case 'MEMBER_ACCEPT':
			case 'TITLE_CHANGE':
			case 'ADDRESS':
			case 'MEMBER_LEAVE':
			case 'MEMBER_JOIN':
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

			default:
				return <Flex className={classes.memberAccept}>{type}</Flex>
		}
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
	const _renderMessageAiIcons = (
		item,
		{ isMe, isTemp, isMemberAction, type },
	) => {
		const { id } = item || {}
		if (isTemp || isMemberAction || isMe || type === 'MEDIAS') return null

		return (
			<Flex
				className={classes.moreIconWrapper}
				onClick={(e) => e.stopPropagation()}
			>
				{type === 'TEXT' && (
					<Flex
						className={clsx(classes.moreIcon, {
							[classes.disabled]: listTranslateLoading[id],
						})}
						onClick={() => onAddTranslate(item)}
					>
						{listTranslateLoading[id] ? <CLoading /> : <TranslateIcon />}
					</Flex>
				)}
				{type === 'TEXT' && (
					<Flex
						className={clsx(classes.moreIcon, {
							[classes.disabled]: listTextToSpeechLoading[id],
							[classes.isPlaying]: playAudioId === id,
						})}
						onClick={() => {
							if (playAudioId === id) {
								onStopAudio(id)
							} else if (!listTextToSpeechLoading[id]) {
								onAddTextToSpeech(item)
							}
						}}
					>
						{listTextToSpeechLoading[id] ? <CLoading /> : <VolumeIcon />}
					</Flex>
				)}
			</Flex>
		)
	}

	const _renderFloatingMessageMenu = () => {
		if (!openReact?.id) return null

		const isMe = getUserInfo('id') === openReact.user_id
		const { reactions } = openReact || {}
		const reactType = (reactions || []).find(
			(i) => i.user_id === getUserInfo('id'),
		)

		return (
			<MessageActionFloatingPopover
				open={!!openReact}
				anchorX={openReact.menuAnchorX ?? 0}
				anchorY={openReact.menuAnchorY ?? 0}
				align={isMe ? 'end' : 'start'}
				reactList={reactList}
				activeReactionId={reactType?.reaction_id}
				menus={onGetMenus({ item: openReact, isMe }) as MessageActionMenuItem[]}
				onReact={(react) => {
					const isActive = reactType?.reaction_id === react.id
					onActionReact({
						item: openReact,
						react,
						type: isActive ? 'remove' : 'add',
					})
				}}
				onClose={() => setOpenReact(null)}
			/>
		)
	}

	const _renderItemChat = ({ item }) => {
		const {
			id,
			user,
			isFirst,
			isLast,
			isNewDate,
			type,
			user_id,
			created_at,
			isTemp,
			reactions,
		} = item || {}

		const isMe = getUserInfo('id') === user_id
		const isMemberAction = specialTypeMessage.includes(type)
		const isNot = isMe || isMemberAction
		const canOpenMessageMenu = !(isTemp || isMemberAction)
		const isImageMediaMessage = isImageOnlyMediaMessage(item)

		return (
			<Flex
				vertical
				key={id}
				ref={(el) => {
					messageRefs.current[id] = el as HTMLDivElement
				}}
				className={clsx({
					[classes.jumpHighlight]: jumpHighlightId === id,
				})}
			>
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
					<Flex
						className={classes.contentItem}
						justify={isMe ? 'flex-end' : undefined}
					>
						{!isNot && (
							<Flex className={classes.avatar}>
								{isFirst && (
									<CAvatar
										style={onAvatarClick ? { cursor: 'pointer' } : undefined}
										src={user?.avatar}
										size={48}
										onClick={() => {
											if (user_id && onAvatarClick) {
												onAvatarClick(user_id)
											}
										}}
									/>
								)}
							</Flex>
						)}
						<Flex
							className={classes.contentInfo}
							vertical
							align={isMe ? 'end' : undefined}
						>
							{isFirst && !isNot && (
								<Flex className={classes.name}>{user?.name}</Flex>
							)}
							<Flex
								className={clsx(classes.content, {
									[classes.isReaction]: isArray(reactions, 1),
								})}
							>
								<div
									className={clsx(classes.messageBubbleHitArea, {
										[classes.messageBubbleInteractive]: canOpenMessageMenu,
									})}
									onClick={(e) => {
										if (!canOpenMessageMenu || isImageMediaMessage) return
										e.stopPropagation()
										onOpenReact(item, e)
									}}
									onContextMenu={(e) => {
										if (!canOpenMessageMenu || !isImageMediaMessage) return
										e.preventDefault()
										e.stopPropagation()
										onOpenReact(item, e)
									}}
								>
									{_renderContentChat(item)}
								</div>
								{_renderMessageAiIcons(item, {
									isMe,
									isTemp,
									isMemberAction,
									type,
								})}
							</Flex>
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
								handleCancelEditMode()
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
	}, [
		activeSticker,
		showSticker,
		stickerList,
		onSendMessage,
		reply,
		setReply,
		setActiveSticker,
	])

	const handleActionMenuClick = useCallback(
		(key: string) => {
			if (key !== 'quick') return
			setShowActionMenu(false)
			setOpenQuickMessage(true)
		},
		[setShowActionMenu],
	)

	const handleSendQuickMessage = useCallback(
		(item: QuickMessageItem) => {
			const content = item?.content || ''
			const medias = mapQuickMessageToSendMedias(item)
			if (!content.trim() && !medias.length) return

			onSendMessage({
				type: 'TEXT',
				content,
				parent: reply,
				medias,
			})
			setReply(null)
		},
		[onSendMessage, reply, setReply],
	)

	const handleSelectQuickMessage = useCallback(
		(item: any) => {
			setText(item?.content || '')
			const medias = item?.medias?.length
				? item.medias
				: item?.media
					? [{ url: item.media, type: 'IMAGE' }]
					: []
			if (medias.length) {
				setFileList(
					medias.map((media: any) => ({
						type: media?.type || 'IMAGE',
						url: media?.url,
					})),
				)
			}
			setOpenQuickMessage(false)
			_refInput?.current?.focus()
		},
		[_refInput, setText],
	)

	const _renderActionMenu = () => (
		<Flex
			className={clsx(classes.chatBoxActionMenu, {
				[classes.showActionMenu]: showActionMenu,
			})}
		>
			{ACTION_ITEMS.map(({ key, label, Icon, enabled, width, height }) => (
				<Flex
					key={key}
					vertical
					align="center"
					className={classes.actionMenuItem}
					onClick={() => handleActionMenuClick(key)}
				>
					<Flex
						className={clsx(classes.actionMenuIcon, {
							[classes.actionMenuIconActive]: enabled,
						})}
					>
						<Icon
							fill={enabled ? '#006B35' : '#48546B'}
							width={width}
							height={height}
						/>
					</Flex>
					<span
						className={clsx(classes.actionMenuLabel, {
							[classes.actionMenuLabelActive]: enabled,
						})}
					>
						{label}
					</span>
				</Flex>
			))}
		</Flex>
	)

	const _renderIconHappy = () => {
		return (
			<Flex
				className={classes.iconHappi}
				onClick={() => {
					setShowSticker((pre) => !pre)
					setShowActionMenu(false)
				}}
			>
				<HappyIcon />
			</Flex>
		)
	}

	const _renderEditMediaThumbnails = () => {
		if (!isArray(fileList, 1)) return null
		return (
			<Flex className={classes.editMediaList} wrap="wrap" gap={8}>
				{fileList.map((i) => {
					const { url, type } = i || {}
					const isImg = type === 'IMAGE'
					return (
						<Flex key={url} className={classes.editMediaItem}>
							{isImg ? (
								<CImage preview src={url} />
							) : (
								<video controls>
									<source src={url} type="video/mp4" />
								</video>
							)}
							<Flex
								className={classes.editMediaCancel}
								onClick={() =>
									setFileList((prev) => prev.filter((p) => p.url !== url))
								}
							>
								<IconCircleXFilled />
							</Flex>
						</Flex>
					)
				})}
			</Flex>
		)
	}

	const _renderEdit = () => {
		if (!editingMessage) return null
		const content = String(editingMessage?.content ?? '').trim()

		return (
			<Flex className={classes.chatReply}>
				<ReplyIcon />
				<Flex className={classes.replyInfo} vertical>
					<div className={classes.replyName}>Editing message</div>
					{content ? (
						<div className={classes.text}>
							<div>{editingMessage.content}</div>
						</div>
					) : null}
					{_renderEditMediaThumbnails()}
				</Flex>
				<Flex className={classes.replyCancel} onClick={handleCancelEditMode}>
					<IconCircleXFilled />
				</Flex>
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
			case 'MEDIAS': {
				const trimmed = String(content ?? '').trim()
				node = trimmed ? (
					<div className={classes.replyMediaCaption}>{content}</div>
				) : (
					<div>Send a photo</div>
				)
				break
			}
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
				if (openReact) setOpenReact(null)
			}}
		>
			{_renderFloatingMessageMenu()}
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
			{editingMessage && _renderEdit()}
			{reply && !editingMessage && _renderReply()}
			{isArray(fileList, 1) && !editingMessage && (
				<Flex className={classes.chooseImgPreviewBar}>
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
			)}
			<Flex className={clsx(classes.chatBox)}>
				<Flex align="center" justify="center" gap={10}>
					<div
						className={classes.miniAppIcon}
						onClick={() => {
							setShowActionMenu((prev) => !prev)
							setShowSticker(false)
						}}
					>
						<MiniApp fill="#006B35" />
					</div>
					<Flex className={classes.chooseImg}>
						<CUploadMuti
							fileList={fileList.filter((i) => i?.file).map((i) => i.file)}
							onChange={({ file: _file, fileList: newList }) => {
								hangleImportImg(newList)
							}}
							accept="image/*,video/*"
						>
							<ImageIcon />
						</CUploadMuti>
					</Flex>
				</Flex>
				<CInputTag
					ref={_refInput}
					id={convId}
					mentionData={mentionData}
					allowClear={false}
					value={text}
					style={{ height: 40 }}
					suffix={_renderIconHappy()}
					placeholder="Enter your text ..."
					onQuickMessageSelect={handleSendQuickMessage}
					// disabled={fileList?.length > 0}
					onChange={(e) => setText(e.target.value)}
					onSendMessage={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault()
							handleSubmitMessage()
						}
					}}
				/>

				{text || isArray(fileList, 1) ? (
					<Flex
						className={classes.sendButton}
						onClick={() => {
							if (!!text.trim() || isArray(fileList, 1)) {
								handleSubmitMessage()
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
			{_renderActionMenu()}
			{openQuickMessage && (
				<QuickMessageModal
					open
					onClose={() => setOpenQuickMessage(false)}
					onSelect={handleSelectQuickMessage}
				/>
			)}
		</div>
	)
}

export default memo(ChatBox)
