'use client'

import { IconChevronLeft } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import { useState } from 'react'

import ModalNotiChatRoom from '@/Components/ChatRoom/ModalNotiChatRoom'
import ModalCancelTalkRoom from '@/Components/Modal/ModalCancelTalkRoom'
import ModalCreateTalkRoom from '@/Components/Modal/ModalCreateTalkRoom'
import ModalEditTalkRoom from '@/Components/Modal/ModalEditTalkRoom'
import TalkRoomConnectedCountryModal from '@/Components/Modal/TalkRoomConnectedCountryModal'
import TalkRoomConnectedUserModal from '@/Components/Modal/TalkRoomConnectedUserModal'
import RoomCard from '@/Components/TalkRoom/RoomCard'
import TalkRoomFilterBar from '@/Components/TalkRoom/TalkRoomFilterBar'
import TalkRoomProfileInfo from '@/Components/TalkRoom/TalkRoomProfileInfo/TalkRoomProfileInfo'
import TalkRoomStats from '@/Components/TalkRoom/TalkRoomStats/TalkRoomStats'
import useTalkRoom from '@/hooks/TalkRoom/useTalkRoom'
import useProfile from '@/hooks/Profile/useProfile'
import { mainRoutes } from '@/routes/MainRoutes'
import BookIcon from '@/svg/BookIcon'
import { TalkRoomRoom, isTalkRoomUserNotified } from '@/ultis/talkRoom'
import { useLocalePath } from '@/ultis/route'

import classes from './TalkRoom.module.scss'

function TalkRoom() {
	const [ruleModalOpen, setRuleModalOpen] = useState(false)
	const [editRoom, setEditRoom] = useState<TalkRoomRoom | null>(null)
	const [cancelRoom, setCancelRoom] = useState<TalkRoomRoom | null>(null)
	const [connectedUsersModalOpen, setConnectedUsersModalOpen] = useState(false)
	const [connectedCountriesModalOpen, setConnectedCountriesModalOpen] =
		useState(false)
	const [createRoomModalOpen, setCreateRoomModalOpen] = useState(false)
	const { onChangeRoute } = useLocalePath()

	const {
		loading,
		myTalkRoomAnalysis,
		displayTalkRooms,
		loadingListTalkRooms,
		loadingLanguages,
		searchKeyword,
		languageFilterOptions,
		selectedLevelFilters,
		listTalkRoomFilters,
		onChangeSearchKeyword,
		onChangeLanguageFilter,
		onChangeLevelFilter,
		onGetDetailTalkRoom,
		onUpdateTalkRoom,
		onDeleteTalkRoom,
		onCountMeInTalkRoom,
		onNotificationMeInTalkRoom,
		loadingUpdate,
		loadingDelete,
		loadingListMyFriendTalkRooms,
		listMyFriendTalkRooms,
		totalMyFriendTalkRooms,
		onLoadMoreListMyFriendTalkRooms,
		connectedUsers,
		connectedCountries,
		totalConnectedUsers,
		loadingConnectedPeople,
		loadingConnectedCountry,
		onGetConnectedUsers,
		onLoadMoreConnectedUsers,
		onGetConnectedCountry,
		onGetMyTalkRoomAnalysis,
		onGetListTalkRoom,
	} = useTalkRoom()
	const { userData } = useProfile({})

	const handleOpenConnectedUsersModal = () => {
		setConnectedUsersModalOpen(true)
		onGetConnectedUsers(false, true)
	}

	const handleOpenConnectedCountriesModal = () => {
		setConnectedCountriesModalOpen(true)
		onGetConnectedCountry()
	}

	const handleCreateRoomFromConnected = () => {
		setConnectedUsersModalOpen(false)
		setConnectedCountriesModalOpen(false)
		setCreateRoomModalOpen(true)
	}

	const handleCreateRoomSuccess = () => {
		setCreateRoomModalOpen(false)
		onGetMyTalkRoomAnalysis()
		onGetListTalkRoom(true)
	}

	const _renderProfile = () => {
		return (
			<div className={classes.profileContainer}>
				<TalkRoomProfileInfo user={userData} />
				<TalkRoomStats
					data={myTalkRoomAnalysis}
					loading={loading}
					onClickPeople={handleOpenConnectedUsersModal}
					onClickCountries={handleOpenConnectedCountriesModal}
				/>
			</div>
		)
	}

	const handleShareRoom = (room: { dynamic_link?: string }) => {
		if (!room?.dynamic_link) return
		if (navigator.share) {
			navigator.share({ url: room.dynamic_link }).catch(() => undefined)
			return
		}
		navigator.clipboard?.writeText(room.dynamic_link)
	}

	const handleCountMeIn = (room: TalkRoomRoom) => {
		onCountMeInTalkRoom(room.id, true)
	}

	const handleNotJoining = (room: TalkRoomRoom) => {
		onCountMeInTalkRoom(room.id, false)
	}

	const handleNotifyMe = (room: TalkRoomRoom) => {
		onNotificationMeInTalkRoom(room.id, !isTalkRoomUserNotified(room))
	}

	const _renderListTalkRoom = () => {
		return (
			<div className={classes.listTalkroomContainer}>
				<Flex className={classes.listTalkroomHeader}>
					<div className={classes.listTalkroomHeaderTitle}>All rooms</div>
					<div className={classes.amountRooms}>{displayTalkRooms?.length}</div>
				</Flex>
				<TalkRoomFilterBar
					searchKeyword={searchKeyword}
					languageId={listTalkRoomFilters.languageIds?.[0] || ''}
					levelValues={selectedLevelFilters}
					languageOptions={languageFilterOptions}
					loadingLanguages={loadingLanguages}
					onChangeSearchKeyword={onChangeSearchKeyword}
					onChangeLanguage={onChangeLanguageFilter}
					onChangeLevel={onChangeLevelFilter}
				/>
				<Flex vertical gap={12} className={classes.listTalkroomInner}>
					{loadingListTalkRooms && !displayTalkRooms.length
						? Array.from({ length: 3 }).map((_, index) => (
								<Skeleton.Input
									key={index}
									active
									block
									style={{ height: 180, borderRadius: 16 }}
								/>
							))
						: displayTalkRooms.map((room) => (
								<RoomCard
									key={room.id}
									room={room}
									onShare={handleShareRoom}
									onCountMeIn={handleCountMeIn}
									onNotJoining={handleNotJoining}
									onNotifyMe={handleNotifyMe}
									onEditRoom={setEditRoom}
									onCancelRoom={setCancelRoom}
								/>
							))}
				</Flex>
			</div>
		)
	}
	const _renderLeaderBoard = () => {
		return <div className={classes.leaderBoardContainer}>Coming soon</div>
	}
	const _renderFriendTalkroomList = () => {
		return (
			<div className={classes.friendTalkroomListContainer}>
				<Flex className={classes.listFriendTalkroomHeader}>
					<div className={classes.listFriendTalkroomHeaderTitle}>
						Your friends are here
					</div>
					<div className={classes.amountFriendRooms}>
						{totalMyFriendTalkRooms}
					</div>
				</Flex>
				<Flex vertical gap={12} className={classes.listFriendTalkroomInner}>
					{loadingListMyFriendTalkRooms && !listMyFriendTalkRooms.length
						? Array.from({ length: 2 }).map((_, index) => (
								<Skeleton.Input
									key={index}
									active
									block
									style={{ height: 220, borderRadius: 16 }}
								/>
							))
						: listMyFriendTalkRooms.map((room) => (
								<RoomCard
									key={room.id}
									room={room}
									variant="friend"
									onShare={handleShareRoom}
									onCountMeIn={handleCountMeIn}
									onNotJoining={handleNotJoining}
									onNotifyMe={handleNotifyMe}
								/>
							))}
				</Flex>
			</div>
		)
	}
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.header}>
				<IconChevronLeft
					className={classes.iconBack}
					onClick={() => onChangeRoute(mainRoutes.overview)}
				/>
				<div className={classes.title}>Talk room</div>
				<div
					className={classes.iconBook}
					onClick={() => setRuleModalOpen(true)}
				>
					<BookIcon fill="#fff" width={14} height={14} />
				</div>
			</Flex>
			<Flex className={classes.content}>
				<div className={classes.leftContent}>
					{_renderProfile()}
					{_renderListTalkRoom()}
				</div>
				<div className={classes.rightContent}>
					{_renderLeaderBoard()}
					{totalMyFriendTalkRooms > 0 && <>{_renderFriendTalkroomList()}</>}
				</div>
			</Flex>

			{editRoom?.id && (
				<ModalEditTalkRoom
					open
					roomId={editRoom.id}
					onGetDetailTalkRoom={onGetDetailTalkRoom}
					onUpdateTalkRoom={onUpdateTalkRoom}
					loadingUpdate={loadingUpdate}
					onClose={() => setEditRoom(null)}
					onSuccess={() => setEditRoom(null)}
				/>
			)}

			{cancelRoom?.id && (
				<ModalCancelTalkRoom
					open
					loading={loadingDelete}
					onClose={() => setCancelRoom(null)}
					onConfirm={async () => {
						const success = await onDeleteTalkRoom(cancelRoom.id)
						if (success) setCancelRoom(null)
					}}
				/>
			)}

			{connectedCountriesModalOpen && (
				<TalkRoomConnectedCountryModal
					open
					onClose={() => setConnectedCountriesModalOpen(false)}
					countries={connectedCountries}
					loading={loadingConnectedCountry}
					onCreateRoom={handleCreateRoomFromConnected}
				/>
			)}

			{connectedUsersModalOpen && (
				<TalkRoomConnectedUserModal
					open
					onClose={() => setConnectedUsersModalOpen(false)}
					users={connectedUsers}
					total={totalConnectedUsers}
					loading={loadingConnectedPeople}
					hasMore={connectedUsers.length < totalConnectedUsers}
					onLoadMore={onLoadMoreConnectedUsers}
					onCreateRoom={handleCreateRoomFromConnected}
				/>
			)}

			{createRoomModalOpen && (
				<ModalCreateTalkRoom
					open
					onClose={() => setCreateRoomModalOpen(false)}
					onSuccess={handleCreateRoomSuccess}
				/>
			)}

			{ruleModalOpen && (
				<ModalNotiChatRoom
					open
					onClose={() => setRuleModalOpen(false)}
					onSubmit={() => setRuleModalOpen(false)}
				/>
			)}
		</div>
	)
}

export default TalkRoom
