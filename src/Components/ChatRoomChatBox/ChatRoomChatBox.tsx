import { IconCircleXFilled } from '@tabler/icons-react'
import { Dropdown, Flex, Menu, Skeleton } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import useChatRoomChatBox from '@/hooks/ChatRoomChatBox/useChatRoomChatBox'
import { QuickMessageItem } from '@/hooks/QuickMesage/useQuickMessage'
import { useModal } from '@/context/ModalContext'

import { arrayFrom, isArray } from '@/ultis/array'
import { parseDayFromIsNewDate } from '@/ultis/date'
import {
	handleParseFileImg,
	handleParseFileVideo,
	mergeChatMediaFileList,
} from '@/ultis/file'
import { useLocalePath } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'

import DotIcon from '@/svg/DotIcon'
import HappyIcon from '@/svg/HappyIcon'
import ImageIcon from '@/svg/ImageIcon'
import MicroPhoneIcon from '@/svg/MicroPhoneIcon'
import ReplyIcon from '@/svg/ReplyIcon'
import SendIcon from '@/svg/SendIcon'
import MiniApp from '@/svg/MiniApp'
import QuickMessageModal from '@/Components/Modal/QuickMesageModal/QuickMessageModal'
import { mapQuickMessageToSendMedias } from '@/Components/Modal/QuickMesageModal/quickMessageUtils'
import AudioRecorder from '../AudioRecorder'
import CAvatar from '../Custom/CAvatar'
import CImage from '../Custom/CImage'
import CInput from '../Custom/CInput'
import CInputTag from '../Custom/CInputTag'
import CLoading from '../Custom/CLoading/CLoading'
import CTextSpecial from '../Custom/CTextSpecial'
import CUploadMuti from '../Custom/CUploadMuti'
import VisualizerWithPlay from '../VisualizerWithPlay'

import {
	ACTION_ITEMS,
	languageOpts,
	specialTypeMessage,
} from '@/Variable/common.variable'
import { mainRoutes } from '@/routes/MainRoutes'

import { MessageActionMenuItem } from '@/Components/ChatBox/MessageActionPopover'
import MessageActionFloatingPopover from '@/Components/ChatBox/MessageActionFloatingPopover'
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
	onEnsureMessageLoaded?: (id: string) => Promise<boolean>
	loadingEnsureMessage?: boolean
	editingMessage?: any
	onEditMessage?: (values: {
		message: any
		content?: string
		medias?: any[]
	}) => void
	onCancelEdit?: () => void
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

const ChatRoomChatBox = (props: ChatRoomChatBoxProps) => {
	const {
		itemList,
		onSendMessage,
		_scrollRef,
		loading,
		convId,
		onEnsureMessageLoaded,
		loadingEnsureMessage,
		editingMessage,
		onEditMessage,
		onCancelEdit,
	} = props
	const { openConfirm, closeModal } = useModal()
	const cancelEditRef = useRef<() => void>(() => {})
	const { onChangeRoute } = useLocalePath()
	const {
		isAudio,
		_refInput,
		activeSticker,
		showSticker,
		stickerList,
		text,
		reply,
		listSpToText,
		listTranslate,
		openReact,
		reactList,
		language,
		searchCountry,

		setSearchCountry,

		setReply,
		setOpenReact,
		setIsAudio,
		setText,
		setActiveSticker,
		setShowSticker,
		onScroll,
		onGetMenus,
		onAddReact,
		onOpenReact,
		onChangeLanguage,
	} = useChatRoomChatBox({
		...props,
		onCancelEdit: () => cancelEditRef.current(),
	})

	const [fileList, setFileList] = useState([])
	const [openQuickMessage, setOpenQuickMessage] = useState(false)
	const [showActionMenu, setShowActionMenu] = useState(false)
	const messageRefs = useRef<Record<string, HTMLDivElement | null>>({})
	const [jumpHighlightId, setJumpHighlightId] = useState('')
	const isJumpingRef = useRef(false)

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
			let targetEl = messageRefs.current[parentId]

			if (!targetEl && onEnsureMessageLoaded) {
				const isLoaded = await onEnsureMessageLoaded(parentId)
				if (isLoaded) {
					await new Promise((resolve) =>
						requestAnimationFrame(() => resolve(null)),
					)
					targetEl = messageRefs.current[parentId]
				}
			}

			if (!targetEl) return

			targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })

			setJumpHighlightId(parentId)
			setTimeout(() => {
				setJumpHighlightId('')
			}, 1500)
		} finally {
			isJumpingRef.current = false
		}
	}

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
					<div className={classes.replyName}>{user?.name}</div>
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
				const isMulti = totalMedia > 1
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
										<CImage preview src={media.url} />
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
							<Flex className={classes.mediasWrapper}>
								{_renderParentItem(parent)}
								<div
									className={clsx(
										isMulti ? classes.multiMediaContent : classes.mediaContent,
										!isAudioMedia && isMulti && classes[`grid${gridCount}`],
									)}
								>
									{Content}
								</div>
								{!!String(content || '').trim() && !isAudioMedia && (
									<div className={classes.mediaCaption}>
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
			case 'OPEN_CHAT_CREATE':
				return <></>
			default:
				return <Flex className={classes.memberAccept}>{type}</Flex>
		}
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
					onAddReact({
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
			isTemp,
			type,
			user_id,
			reactions,
			created_at,
			edited_at,
		} = item || {}

		const isMe = getUserInfo('id') === user_id
		const isMemberAction = specialTypeMessage.includes(type)
		if (isMemberAction) return
		const isNot = isMe || isMemberAction
		const canOpenMessageMenu = !(isTemp || isMemberAction)

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
										size={48}
									/>
								)}
							</Flex>
						)}
						<Flex className={classes.contentInfo} vertical>
							{isFirst && (
								<Flex className={classes.infoNameTime}>
									{!isNot && <Flex className={classes.name}>{user?.name}</Flex>}
									{/* {!isMemberAction && _renderMessageTime(created_at, edited_at)} */}
								</Flex>
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
										if (!canOpenMessageMenu) return
										e.stopPropagation()
										onOpenReact(item, e)
									}}
								>
									{_renderContentChat(item)}
								</div>
							</Flex>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		)
	}
	const handleActionMenuClick = useCallback(
		(key: string) => {
			if (key !== 'quick') return
			setShowActionMenu(false)
			setOpenQuickMessage(true)
		},
		[],
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
		(item: QuickMessageItem) => {
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

		return (
			<Flex className={classes.chatReply}>
				<ReplyIcon />
				<Flex className={classes.replyInfo} vertical>
					<div className={classes.replyName}>Editing message</div>
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
								handleImportMedia(newList)
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

export default memo(ChatRoomChatBox)
