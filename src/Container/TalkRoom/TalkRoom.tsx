'use client'

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import { useMemo, useState } from 'react'

import ModalNotiChatRoom from '@/Components/ChatRoom/ModalNotiChatRoom'
import ModalCancelTalkRoom from '@/Components/Modal/ModalCancelTalkRoom'
import ModalCreateTalkRoom from '@/Components/Modal/ModalCreateTalkRoom'
import ModalEditTalkRoom from '@/Components/Modal/ModalEditTalkRoom'
import ModalTalkRoomWarning from '@/Components/Modal/ModalTalkRoomWarning'
import TalkRoomConnectedCountryModal from '@/Components/Modal/TalkRoomConnectedCountryModal'
import TalkRoomConnectedUserModal from '@/Components/Modal/TalkRoomConnectedUserModal'
import TalkRoomPeoplePlanJoinModal from '@/Components/Modal/TalkRoomPeoplePlanJoinModal'
import ReferralLeaderboardPodium from '@/Components/Referral/ReferralLeaderboardPodium/ReferralLeaderboardPodium'
import RoomCard from '@/Components/TalkRoom/RoomCard'
import TalkRoomFilterBar from '@/Components/TalkRoom/TalkRoomFilterBar'
import TalkRoomListEmpty from '@/Components/TalkRoom/TalkRoomListEmpty'
import TalkRoomProfileInfo from '@/Components/TalkRoom/TalkRoomProfileInfo/TalkRoomProfileInfo'
import TalkRoomStats from '@/Components/TalkRoom/TalkRoomStats/TalkRoomStats'
import { createConversation } from '@/apis/conversationApis'
import { canCreateTalkRoom } from '@/apis/talkRoomApis'
import useTalkRoom from '@/hooks/TalkRoom/useTalkRoom'
import useProfile from '@/hooks/Profile/useProfile'
import { useModal } from '@/context/ModalContext'
import { mainRoutes } from '@/routes/MainRoutes'
import BookIcon from '@/svg/BookIcon'
import {
	setTalkRoomAutoJoinFlag,
	TalkRoomRoom,
	formatHostMinutes,
	isTalkRoomUserNotified,
} from '@/ultis/talkRoom'
import { useLocalePath } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'

import classes from './TalkRoom.module.scss'
import CButtonCreate from '@/Components/Custom/CButtonCreate'

function TalkRoom() {
	const [ruleModalOpen, setRuleModalOpen] = useState(false)
	const [editRoom, setEditRoom] = useState<TalkRoomRoom | null>(null)
	const [cancelRoom, setCancelRoom] = useState<TalkRoomRoom | null>(null)
	const [connectedUsersModalOpen, setConnectedUsersModalOpen] = useState(false)
	const [connectedCountriesModalOpen, setConnectedCountriesModalOpen] =
		useState(false)
	const [createRoomModalOpen, setCreateRoomModalOpen] = useState(false)
	const [createTalkRoomWarningOpen, setCreateTalkRoomWarningOpen] =
		useState(false)
	const [cmiPeopleModalOpen, setCmiPeopleModalOpen] = useState(false)
	const { onChangeRoute } = useLocalePath()
	const { openError } = useModal()
	const { userData } = useProfile({})
	const currentUserId = userData?.id || getUserInfo('id')

	const {
		loading,
		myTalkRoomAnalysis,
		displayTalkRooms,
		listTalkRooms,
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
		talkRoomDetail,
		loadingUpdate,
		loadingDelete,
		loadingListMyFriendTalkRooms,
		listMyFriendTalkRooms,
		totalMyFriendTalkRooms,
		loadingLeaderBoard,
		topLeaderBoard,
		onLoadMoreListMyFriendTalkRooms,
		connectedUsers,
		connectedCountries,
		totalConnectedUsers,
		loadingConnectedPeople,
		loadingConnectedCountry,
		countMeInUsers,
		totalCountMeInUsers,
		loadingCountMeInList,
		onGetConnectedUsers,
		onLoadMoreConnectedUsers,
		onGetConnectedCountry,
		onGetCountMeInList,
		onLoadMoreCountMeInList,
		onGetMyTalkRoomAnalysis,
		onGetListTalkRoom,
	} = useTalkRoom()

	const hasActiveSearch = Boolean(searchKeyword?.trim())
	const hasActiveFilters = Boolean(
		listTalkRoomFilters.languageIds?.length ||
		listTalkRoomFilters.levels?.length,
	)

	const topHosts = useMemo(
		() =>
			topLeaderBoard.map((item) => ({
				id: item.user_id,
				name: item.user?.name,
				avatar: item.user?.avatar,
				scoreLabel: formatHostMinutes(item.total_hosting_seconds),
			})),
		[topLeaderBoard],
	)

	const isTrulyEmpty = useMemo(
		() =>
			!loadingListTalkRooms &&
			listTalkRooms.length === 0 &&
			!hasActiveSearch &&
			!hasActiveFilters,
		[
			hasActiveFilters,
			hasActiveSearch,
			listTalkRooms.length,
			loadingListTalkRooms,
		],
	)

	const isNoResults = useMemo(
		() =>
			!loadingListTalkRooms && displayTalkRooms.length === 0 && !isTrulyEmpty,
		[displayTalkRooms.length, isTrulyEmpty, loadingListTalkRooms],
	)

	const handleOpenConnectedUsersModal = () => {
		setConnectedUsersModalOpen(true)
		onGetConnectedUsers(false, true)
	}

	const handleOpenConnectedCountriesModal = () => {
		setConnectedCountriesModalOpen(true)
		onGetConnectedCountry()
	}

	const ensureCanCreateTalkRoom = async () => {
		try {
			const res: any = await canCreateTalkRoom()
			const payload = res?.results?.object
			const canCreate = payload?.can_create ?? payload?.canCreate

			if (canCreate === false) {
				const denyReason =
					payload?.deny_reason ?? payload?.denyReason ?? payload?.reason
				openError(
					typeof denyReason === 'string'
						? denyReason
						: 'You cannot create a talk room right now',
				)
				return false
			}

			return true
		} catch (error) {
			openError(error)
			return false
		}
	}

	const handleOpenCreateTalkRoomWarning = async () => {
		const canCreate = await ensureCanCreateTalkRoom()
		if (!canCreate) return

		setCreateTalkRoomWarningOpen(true)
	}

	const handleConfirmCreateTalkRoomWarning = () => {
		setCreateTalkRoomWarningOpen(false)
		setCreateRoomModalOpen(true)
	}

	const handleCreateRoomFromConnected = async () => {
		const canCreate = await ensureCanCreateTalkRoom()
		if (!canCreate) return

		setConnectedUsersModalOpen(false)
		setConnectedCountriesModalOpen(false)
		setCreateRoomModalOpen(true)
	}

	const handleCreateRoomSuccess = () => {
		setCreateRoomModalOpen(false)
		onGetMyTalkRoomAnalysis()
		onGetListTalkRoom(true)
	}

	const requestMicrophonePermission = async () => {
		if (!navigator.mediaDevices?.getUserMedia) return

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			stream.getTracks().forEach((track) => track.stop())
		} catch {
			// Host can still enter the room and enable mic later.
		}
	}

	const handleInstantRoomCreated = (room: TalkRoomRoom) => {
		if (!room?.id) return

		setCreateRoomModalOpen(false)
		onGetMyTalkRoomAnalysis()
		onGetListTalkRoom(true)
		setTalkRoomAutoJoinFlag(room.id)

		window.setTimeout(async () => {
			await requestMicrophonePermission()
			onChangeRoute(`${mainRoutes.talkroom}/${room.id}`)
		}, 500)
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

	const handleViewCmiPeople = (room: TalkRoomRoom) => {
		if (!room?.id) return
		setCmiPeopleModalOpen(true)
		onGetCountMeInList(room.id, false, true)
	}

	const handleStartTalkroom = (room: TalkRoomRoom) => {
		if (!room?.id) return
		onGetDetailTalkRoom(room.id)
		onChangeRoute(`${mainRoutes.talkroom}/${room.id}`)
	}

	const handleMessageCmiUser = async (userId: string) => {
		if (!userId || userId === currentUserId) return

		try {
			const { name } = getUserInfo() || {}
			const res: any = await createConversation({
				title: name || '',
				member_ids: [userId],
			})
			const conversationId = res?.results?.object?.id
			if (!conversationId) return

			setCmiPeopleModalOpen(false)
			onChangeRoute(`${mainRoutes.inbox}?id=${conversationId}`)
		} catch (error) {
			openError(error)
		}
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
					languageIds={listTalkRoomFilters.languageIds || []}
					levelValues={selectedLevelFilters}
					languageOptions={languageFilterOptions}
					loadingLanguages={loadingLanguages}
					onChangeSearchKeyword={onChangeSearchKeyword}
					onChangeLanguage={onChangeLanguageFilter}
					onChangeLevel={onChangeLevelFilter}
				/>
				<Flex vertical gap={12} className={classes.listTalkroomInner}>
					{loadingListTalkRooms && !displayTalkRooms.length ? (
						Array.from({ length: 3 }).map((_, index) => (
							<Skeleton.Input
								key={index}
								active
								block
								style={{ height: 180, borderRadius: 16 }}
							/>
						))
					) : isTrulyEmpty ? (
						<TalkRoomListEmpty
							variant="empty"
							onCreateRoom={() => setCreateRoomModalOpen(true)}
						/>
					) : isNoResults ? (
						<TalkRoomListEmpty variant="search" />
					) : (
						displayTalkRooms.map((room) => (
							<RoomCard
								key={room.id}
								room={room}
								onShare={handleShareRoom}
								onCountMeIn={handleCountMeIn}
								onNotJoining={handleNotJoining}
								onNotifyMe={handleNotifyMe}
								onViewCmiPeople={handleViewCmiPeople}
								onEditRoom={setEditRoom}
								onCancelRoom={setCancelRoom}
								onStart={handleStartTalkroom}
								onJoin={handleStartTalkroom}
							/>
						))
					)}
				</Flex>
			</div>
		)
	}
	const _renderLeaderBoard = () => {
		return (
			<div className={classes.leaderBoardContainer}>
				<Flex align="center" gap={4}>
					<div className={classes.leaderBoardTitle}>Top 3 hosts</div>
					<IconChevronRight
						size={16}
						className={classes.leaderBoardIcon}
						onClick={() => onChangeRoute(mainRoutes.talkroomLeaderBoard)}
					/>
				</Flex>
				<div className={classes.topLeaderBoardContainer}>
					<ReferralLeaderboardPodium
						topInvitees={topHosts}
						loading={loadingLeaderBoard}
					/>
				</div>
			</div>
		)
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
									onViewCmiPeople={handleViewCmiPeople}
									onStart={handleStartTalkroom}
								/>
							))}
				</Flex>
			</div>
		)
	}
	return (
		<div className={classes.wrapper}>
			<div className={classes.createRoomBtnWrapper}>
				<CButtonCreate isIcon onClick={() => setCreateRoomModalOpen(true)}>
					Create talk room
				</CButtonCreate>
			</div>
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

			{cmiPeopleModalOpen && (
				<TalkRoomPeoplePlanJoinModal
					open
					onClose={() => setCmiPeopleModalOpen(false)}
					users={countMeInUsers}
					loading={loadingCountMeInList}
					hasMore={countMeInUsers.length < totalCountMeInUsers}
					currentUserId={currentUserId}
					onLoadMore={onLoadMoreCountMeInList}
					onMessage={handleMessageCmiUser}
				/>
			)}

			{createTalkRoomWarningOpen && (
				<ModalTalkRoomWarning
					open
					onClose={() => setCreateTalkRoomWarningOpen(false)}
					onConfirm={handleConfirmCreateTalkRoomWarning}
				/>
			)}

			{createRoomModalOpen && (
				<ModalCreateTalkRoom
					open
					onClose={() => setCreateRoomModalOpen(false)}
					onSuccess={handleCreateRoomSuccess}
					onInstantRoomCreated={handleInstantRoomCreated}
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
