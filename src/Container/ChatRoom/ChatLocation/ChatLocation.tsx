'use client'

import { Flex } from 'antd'
import { memo } from 'react'

import CInputMap from '@/Components/Custom/CInputMap'
import ChatLocationList from '@/Components/ChatLocation/ChatLocationList/ChatLocationList'
import useChatLocation from '@/hooks/ChatRoom/useChatLocation'
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
	} = useChatLocation({})

	const handleItemClick = (item: ChatLocationItemProps) => {
		onPushState({ type: 'location', id: item.id })
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
					longitude={0}
					latitude={0}
					prefix={<SearchIcon />}
				/>
			</div>

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
