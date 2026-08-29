'use client'

import { Flex } from 'antd'
import { memo, useEffect, useRef, useState } from 'react'

import CInputMap from '@/Components/Custom/CInputMap'
import ChatLocationItem from '@/Components/ChatLocation/ChatLocationItem/ChatLocationItem'
import ChatLocationList from '@/Components/ChatLocation/ChatLocationList/ChatLocationList'
import { showMiniChatJoinedToast } from '@/Components/Toast/SocketToastContent'
import useChatLocation, {
	ChatLocationEntry,
} from '@/hooks/ChatRoom/useChatLocation'
import AddIcon from '@/svg/AddIcon'
import GlobalIcon from '@/svg/GlobalIcon'
import SearchIcon from '@/svg/SearchIcon'
import { isArray } from '@/ultis/array'
import { onPushState, useQuery } from '@/ultis/route'

import {
	ChatLocationItemProps,
	FullMiniChatItemProps,
	MiniChatItemProps,
} from '@/interface/Conversation/Conversation.interface'

import DetailChatRoom from '../DetailChatRoom'
import classes from './ChatLocation.module.scss'

interface SuggestChatLocationItemProps {
	id: string | null
	title: string
	level?: number
	loading?: boolean
	onClick?: () => void
}

// Render a compact suggested chat location card.
const SuggestChatLocationItem = (props: SuggestChatLocationItemProps) => {
	const { title, loading, onClick } = props

	return (
		<Flex
			vertical
			className={classes.suggestItem}
			aria-disabled={loading}
			onClick={loading ? undefined : onClick}
		>
			<Flex className={classes.suggestTitle}>
				<span className={classes.suggestIcon}>
					<GlobalIcon fill="#0067b8" width={12} height={12} />
				</span>
				<span className={classes.suggestName}>{title}</span>
			</Flex>
			<Flex className={classes.suggestOnline}>
				<span className={classes.suggestOnlineDot} />
				<span>0 online</span>
			</Flex>
		</Flex>
	)
}

interface ChatLocationProps {
	id?: string
	isChatRoomDetail?: boolean
}

function ChatLocation(props: ChatLocationProps) {
	const { id, isChatRoomDetail } = props
	const { onGetQuerry } = useQuery()
	const { mini_id: activeMiniChatId } = onGetQuerry()
	const {
		loading,
		listMyChatLocation,
		listActiveChatLocation,
		listSuggestChatLocation,
		listFindChatLocation,
		findKeyword,
		enteringLocationKey,
		miniChatActionId,
		onFindChatLocation,
		onEnterChatLocation,
		onRefreshMyChatLocation,
		listMyMiniChat,
		listFullMiniChat,

		// Actions
		onGetListMyMiniChat,
		onGetListFullMiniChat,
		onLeaveMiniChat,
	} = useChatLocation({ id })
	const [mapValue, setMapValue] = useState({
		address: '',
		latitude: 0,
		longitude: 0,
	})
	const pendingJoinIdRef = useRef<string | null>(null)

	useEffect(() => {
		if (!id) return
		onGetListMyMiniChat(id)
		onGetListFullMiniChat(id)
	}, [id])

	// Open a mini chat while preserving its parent location in the URL.
	const handleSelectMiniChat = (
		item: Pick<MiniChatItemProps, 'id'>,
		options?: { isJoining?: boolean },
	) => {
		if (!id || !item.id) return
		// Only rooms opened from the selector should confirm the join with a toast.
		pendingJoinIdRef.current = options?.isJoining ? item.id : null
		onPushState({ type: 'location', id, mini_id: item.id })
	}

	// Refresh location lists after a join/leave and confirm intentional joins.
	const handleSuccessDetailChat = ({
		type,
		id: convId,
	}: {
		type?: string
		id?: string
	}) => {
		if (type !== 'join' && type !== 'leave') return

		onRefreshMyChatLocation()
		onGetListMyMiniChat(id)
		onGetListFullMiniChat(id)

		if (type === 'join' && pendingJoinIdRef.current === convId) {
			pendingJoinIdRef.current = null
			showMiniChatJoinedToast()
		}
	}

	// Return from a mini chat to the parent chat-location room.
	const handleSelectParentChat = () => {
		if (!id) return
		onPushState({ type: 'location', id })
	}

	// Leave a joined mini chat and return home if it is currently open.
	const handleLeaveMiniChat = async (item: FullMiniChatItemProps) => {
		const success = await onLeaveMiniChat(item.id)
		if (success && activeMiniChatId === item.id) {
			handleSelectParentChat()
		}
		return success
	}

	const handleItemClick = (item: ChatLocationItemProps) => {
		onEnterChatLocation(item)
	}

	// Find chat locations for the place picked on the map.
	const handleSubmitMap = (value: {
		display_name?: string
		lat?: number
		lng?: number
	}) => {
		const { display_name = '', lat, lng } = value || {}
		const latitude = Number(lat) || 0
		const longitude = Number(lng) || 0

		setMapValue({ address: display_name, latitude, longitude })
		onFindChatLocation({ latitude, longitude, keyword: display_name })
	}

	const _renderFindSection = () => {
		if (!isArray(listFindChatLocation, 1)) return null

		return (
			<section className={classes.findSection}>
				<div className={classes.findHeading}>
					<span className={classes.findHeadingTitle}>
						Result for “{findKeyword}”
					</span>
					<span className={classes.findCounter}>
						{listFindChatLocation.length}
					</span>
				</div>
				<div className={classes.findTags}>
					{listFindChatLocation.map((item) => (
						<button
							key={item.id || item.title}
							type="button"
							className={classes.findTag}
							disabled={
								enteringLocationKey ===
								(item.id || `${item.title}-${item.level || ''}`)
							}
							onClick={() => onEnterChatLocation(item)}
						>
							<span className={classes.findTagIcon}>
								<AddIcon fill="#e55a0f" />
							</span>
							<span className={classes.findTagText}>{item.title}</span>
						</button>
					))}
				</div>
			</section>
		)
	}

	const _renderSuggestSection = () => {
		const isLoading = loading.suggestChatLocation
		if (!isLoading && !isArray(listSuggestChatLocation, 1)) return null

		return (
			<section className={classes.suggestSection}>
				<div className={classes.suggestHeading}>
					<span className={classes.suggestHeadingTitle}>Suggestions</span>
					<span className={classes.suggestCounter}>
						{isLoading ? '...' : listSuggestChatLocation.length}
					</span>
				</div>
				{!isLoading && (
					<div className={classes.suggestList}>
						{listSuggestChatLocation.map((item: ChatLocationEntry) => (
							<SuggestChatLocationItem
								key={item.id || `${item.title}-${item.level || ''}`}
								id={item.id}
								title={item.title}
								level={item.level}
								loading={
									enteringLocationKey ===
									(item.id || `${item.title}-${item.level || ''}`)
								}
								onClick={() => onEnterChatLocation(item)}
							/>
						))}
					</div>
				)}
			</section>
		)
	}

	if (isChatRoomDetail && id) {
		return (
			<div className={classes.detailLayout}>
				<aside className={classes.detailSidebar}>
					<div className={classes.detailSidebarTitle}>Your rooms</div>
					<div className={classes.detailRoomList}>
						{listMyChatLocation.map((item) => (
							<div
								key={item.id}
								className={classes.detailRoomItem}
								aria-current={item.id === id}
							>
								<ChatLocationItem
									item={item}
									variant="myChatLocation"
									onClick={() => handleItemClick(item)}
								/>
							</div>
						))}
					</div>
				</aside>
				<div className={classes.detailChat}>
					<DetailChatRoom
						id={activeMiniChatId || id}
						isChatLocation
						miniChats={listMyMiniChat}
						fullMiniChats={listFullMiniChat}
						activeMiniChatId={activeMiniChatId}
						miniChatsLoading={loading.getMyMiniChat}
						fullMiniChatsLoading={loading.getFullMiniChat}
						miniChatActionId={miniChatActionId}
						onSelectMiniChat={handleSelectMiniChat}
						onSelectParentChat={handleSelectParentChat}
						onLeaveMiniChat={handleLeaveMiniChat}
						onSuccess={handleSuccessDetailChat}
					/>
				</div>
			</div>
		)
	}

	return (
		<div className={classes.wrapper}>
			<div className={classes.search}>
				<CInputMap
					placeholder="Search by city or country"
					value={mapValue.address}
					longitude={mapValue.longitude}
					latitude={mapValue.latitude}
					prefix={<SearchIcon />}
					onSubmitModal={handleSubmitMap}
				/>
			</div>

			{_renderFindSection()}

			<ChatLocationList
				title="Your rooms"
				items={listMyChatLocation}
				variant="myChatLocation"
				loading={loading.myChatLocation}
				onItemClick={handleItemClick}
			/>

			<ChatLocationList
				title="Top active room"
				items={listActiveChatLocation}
				variant="activeChatLocation"
				loading={loading.activeChatLocation}
				onItemClick={handleItemClick}
			/>

			{_renderSuggestSection()}
		</div>
	)
}

export default memo(ChatLocation)
