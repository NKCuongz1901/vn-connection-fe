'use client'

import { Flex } from 'antd'
import { memo, useState } from 'react'

import CInputMap from '@/Components/Custom/CInputMap'
import ChatLocationList from '@/Components/ChatLocation/ChatLocationList/ChatLocationList'
import useChatLocation from '@/hooks/ChatRoom/useChatLocation'
import AddIcon from '@/svg/AddIcon'
import GlobalIcon from '@/svg/GlobalIcon'
import SearchIcon from '@/svg/SearchIcon'
import { isArray } from '@/ultis/array'
import { onPushState } from '@/ultis/route'

import { ChatLocationItemProps } from '@/interface/Conversation/Conversation.interface'

import classes from './ChatLocation.module.scss'

interface SuggestChatLocationItemProps {
	id: string
	title: string
	onClick?: () => void
}

// Render a compact suggested chat location card.
const SuggestChatLocationItem = (props: SuggestChatLocationItemProps) => {
	const { title, onClick } = props

	return (
		<Flex vertical className={classes.suggestItem} onClick={onClick}>
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

function ChatLocation() {
	const {
		loading,
		listMyChatLocation,
		listActiveChatLocation,
		listSuggestChatLocation,
		listFindChatLocation,
		findKeyword,
		onFindChatLocation,
	} = useChatLocation({})
	const [mapValue, setMapValue] = useState({
		address: '',
		latitude: 0,
		longitude: 0,
	})

	const handleItemClick = (item: ChatLocationItemProps) => {
		onPushState({ type: 'location', id: item.id })
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
							disabled={!item.id}
							onClick={() =>
								item.id && onPushState({ type: 'location', id: item.id })
							}
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
						{listSuggestChatLocation.map(
							(item: { id: string; title: string }) => (
								<SuggestChatLocationItem
									key={item.id}
									id={item.id}
									title={item.title}
									onClick={() => onPushState({ type: 'location', id: item.id })}
								/>
							),
						)}
					</div>
				)}
			</section>
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
