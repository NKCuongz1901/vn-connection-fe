import { GoogleMap, Marker } from '@react-google-maps/api'
import { IconMapPinFilled } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import Link from 'next/link'
import { memo, useCallback } from 'react'

import { arrayFrom } from '@/ultis/array.ults'
import { goToGoogleMap, onPushState, useLocalePath } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CGGMap from '@/Components/Custom/CGGMap/CGGMap'
import CImage from '@/Components/Custom/CImage'
import CInput from '@/Components/Custom/CInput'
import ModalReport from '@/Components/Custom/ModalReport'
import useHangoutChat from '@/hooks/Hangout/useHangoutChat'
import { mainRoutes } from '@/routes/MainRoutes'
import HappyIcon from '@/svg/HappyIcon'
import ImageIcon from '@/svg/ImageIcon'
import MoreIcon from '@/svg/MoreIcon'
import SendIcon from '@/svg/SendIcon'
import ModelChooseHangout from '../ModelChooseHangout'

import { specialTypeMessage } from '@/Variable/common.variable'

import classes from './HangoutChat.module.scss'

const containerStyle = { width: '100%', height: '104px' }

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
		isLoaded,
		showGGmap,
		setShowGGmap,
		setText,
		setActiveSticker,
		setShowSticker,
		onSendMessage,
		onScroll,
		onChangeTitleHangout,
		onEditLocation,
	} = useHangoutChat({ postId })
	const { latitude, longitude } = hangoutInfo || {}

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
		const { latitude, longitude } = data

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
			case 'location':
				content = (
					<CGGMap
						latitude={latitude}
						longitude={longitude}
						onClose={() => setModal(null)}
						onSubmit={onEditLocation}
					/>
				)
				break
			case 'report':
				content = (
					<ModalReport
						open
						onClose={() => setModal(null)}
						data={data}
						message={'You want to report this hangout?'}
					/>
				)
				break
			default:
				break
		}
		return content
	}
	const _renderGGMap = () => {
		if (!isLoaded || showGGmap) return null
		return (
			<div className={classes.ggMap}>
				<GoogleMap
					center={{ lat: latitude, lng: longitude }}
					zoom={15}
					mapContainerStyle={containerStyle}
				>
					{<Marker position={{ lat: latitude, lng: longitude }} />}
				</GoogleMap>
			</div>
		)
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
				<Flex className={classes.participants}>
					<Flex className={classes.avatars}>
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
					<Flex gap={4}>
						<Flex
							onClick={() => goToGoogleMap({ lat: latitude, lng: longitude })}
						>
							<IconMapPinFilled size={18} color="#006b35" cursor="pointer" />
						</Flex>
						<Flex onClick={() => setShowGGmap((pre) => !pre)}>
							Meeting point
						</Flex>
					</Flex>
				</Flex>
				{_renderGGMap()}
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
				{modal?.type && _renderModal()}
			</Flex>
		</div>
	)
}

export default memo(HangoutChat)
