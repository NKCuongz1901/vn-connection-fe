import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import useOverview from '@/hooks/Overview/useOverview'

import { arrayFrom, isArray } from '@/ultis/array'
import { getDiffFromNow } from '@/ultis/date'
import { useLocalePath } from '@/ultis/route'
import { formatNumberString } from '@/ultis/string'

import CheckEmail from '@/Components/CheckEmail/CheckEmail'
import ModalCRUDCommunity from '@/Components/Community/ModalCRUDCommunity'
import CAvatar from '@/Components/Custom/CAvatar'
import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import CButton from '@/Components/Custom/CButton'
import CButtonCreate from '@/Components/Custom/CButtonCreate'
import CDatePickerRanger from '@/Components/Custom/CDatePickerRanger'
import CInput from '@/Components/Custom/CInput'
import CSelect from '@/Components/Custom/CSelect'
import EventTitle from '@/Components/Event/EventTitle'
import ItemEvent from '@/Components/Event/ItemEvent'
import ItemEventTicket from '@/Components/Event/ItemEventTicket'
import ModalCRUDEvent from '@/Components/Event/ModalCRUDEvent'
import ModelChooseHangout from '@/Components/Hangout/ModelChooseHangout'
import EventIcon from '@/svg/Event'
import GlobalIcon from '@/svg/GlobalIcon'
import PencilIcon from '@/svg/Hangout/PencilIcon'
import MarkIcon from '@/svg/MarkIcon'
import Message2Icon from '@/svg/Message2Icon'
import NotFound from '@/svg/NotFound'
import Party from '@/svg/Party'
import People from '@/svg/People'
import PeopleSmileIcon from '@/svg/PeopleSmileIcon'
import SearchIcon from '@/svg/SearchIcon'
import MicroPhoneIcon from '@/svg/MicroPhoneIcon'
import UpcomingEvent from '@/svg/UpcomingEvent'
import CalendarIcon from '@/svg/CalenderIcon'

import { mainRoutes } from '@/routes/MainRoutes'
import { mappingEventTitle } from '@/Variable/event.variable'
import { radiusOpts, typeEvent } from '@/Variable/select.variable'

import CSwitch from '@/Components/Custom/CSwitch'
import { LEFT_FLAG } from '@/Variable/countryVariable'
import classes from './Overview.module.scss'
import TalkRoomCard from '@/Components/TalkRoom/TalkRoomCard/TalkRoomCard'
import ModalNotiChatRoom from '@/Components/ChatRoom/ModalNotiChatRoom'
import ModalTalkRoomWelcome from '@/Components/Modal/ModalTalkRoomWelcome'
import LiveIcon from '@/svg/Talkroom/LiveIcon'
import ModalTalkRoomSoundQuality from '@/Components/Modal/ModalTalkRoomSoundQuality'
import ModalCreateTalkRoom from '@/Components/Modal/ModalCreateTalkRoom'
import { TalkRoomListItem } from '@/apis/talkRoomApis'
import { setTalkRoomAutoJoinFlag } from '@/ultis/talkRoom'

const Overview = () => {
	const { loadingContext } = useLoading()
	const { onChangeRoute } = useLocalePath()
	const {
		_childRef,
		userData,
		modal,
		listMyEvent,
		loadingProfile,
		loadingMyEvent,
		totalMyEvent,
		totalHangout,
		hangoutPeople,
		filters,
		listNetwork,
		listChatRoom,
		defaultTitleHangout,
		checkmail,
		listTalkroom,
		totalTalkroom,
		statsTalkroom,
		listChatlocation,
		totalChatlocation,

		setModal,
		OnChangeTitleHangout,
		onCRUDSuccess,
		onScroll,

		loading,
		total,
		listPost,
		_parentRef,
		_childRefUp,
		onScrollUp,
		onChangeFilter,
		onChangeKeyword,
		onCheckEmail,
		setCheckmail,
		onCheckMailSubmit,
		onUpdateUserInfo,
		onRefreshTalkroomOverview,
	} = useOverview()
	const [talkRoomJoinModal, setTalkRoomJoinModal] = useState<{
		open: boolean
		roomId?: string
	}>({ open: false })
	const [modalSoundQuality, setModalSoundQuality] = useState<{
		open: boolean
	}>({ open: false })
	const [createTalkRoomModal, setCreateTalkRoomModal] = useState<{
		open: boolean
	}>({ open: false })
	const [talkRoomRuleModal, setTalkRoomRuleModal] = useState<{
		open: boolean
	}>({ open: false })
	const [chatRoomTab, setChatRoomTab] = useState<'language' | 'location'>(
		'language',
	)

	const handleChatRoomTabClick = (next: 'language' | 'location') => {
		if (chatRoomTab === next) {
			onChangeRoute(`${mainRoutes.chatRoom}?type=${next}`)
			return
		}
		setChatRoomTab(next)
	}

	const handleOpenTalkRoomJoinModal = (roomId: string) => {
		if (userData.keyIntroTalkRoom === true) {
			onChangeRoute(`${mainRoutes.talkroom}`)
			return
		}

		setTalkRoomJoinModal({ open: true, roomId })
	}

	const canShowSoundQualityModal = () => {
		if (userData.keyIntroTalkRoom !== true) return false

		const viewCount = Number(userData.keyAudioRemind) || 0
		return viewCount < 2
	}

	const handleOpenModalSoundQuality = () => {
		if (!canShowSoundQualityModal()) return

		setModalSoundQuality({ open: true })
	}

	const handleCloseTalkRoomJoinModal = () => {
		setTalkRoomJoinModal({ open: false })
	}

	const handleCloseModalSoundQuality = () => {
		setModalSoundQuality({ open: false })
	}

	const handleConfirmSoundQuality = async () => {
		const nextCount = (Number(userData.keyAudioRemind) || 0) + 1
		await onUpdateUserInfo({
			status_of_tutorial: {
				_keyIntroTalkRoom: true,
				_keyAudioRemind: nextCount,
			},
		})
		setModalSoundQuality({ open: false })
	}

	const handleOpenCreateTalkRoomModal = (e?: React.MouseEvent) => {
		e?.stopPropagation?.()
		setCreateTalkRoomModal({ open: true })
	}

	const handleCloseCreateTalkRoomModal = () => {
		setCreateTalkRoomModal({ open: false })
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

	const handleInstantRoomCreated = (room: TalkRoomListItem) => {
		if (!room?.id) return

		handleCloseCreateTalkRoomModal()
		onRefreshTalkroomOverview()
		setTalkRoomAutoJoinFlag(room.id)

		window.setTimeout(async () => {
			await requestMicrophonePermission()
			onChangeRoute(`${mainRoutes.talkroom}/${room.id}`)
		}, 500)
	}

	const handleConfirmTalkRoomWelcome = async () => {
		await onUpdateUserInfo({
			status_of_tutorial: {
				_keyIntroTalkRoom: true,
			},
		})

		setTalkRoomJoinModal((prev) => ({ ...prev, open: false }))
		setTalkRoomRuleModal({ open: true })
	}

	const handleCloseTalkRoomRuleModal = () => {
		setTalkRoomRuleModal({ open: false })
	}

	const handleConfirmTalkRoomJoin = () => {
		const { roomId } = talkRoomJoinModal
		setTalkRoomJoinModal({ open: false })
		setTalkRoomRuleModal({ open: false })
		if (roomId) {
			onChangeRoute(`${mainRoutes.talkroom}?id=${roomId}`)
		}
	}

	const handleGoOnline = async () => {
		await onUpdateUserInfo({ is_open_hangout: true })
		onChangeRoute(mainRoutes.hangout)
	}
	const _renderFilter = () => {
		const { radius, date, categories, title } = filters
		return (
			<Flex vertical className={classes.renderFilter}>
				<Flex className={classes.filter}>
					<Flex className={classes.search}>
						<CInput
							value={title}
							placeholder="Search by keywords"
							style={{ background: '#fff', borderRadius: 40, height: 44 }}
							prefix={<SearchIcon />}
							onChange={onChangeKeyword}
						/>
					</Flex>
					<Flex>
						<CDatePickerRanger
							isWhite
							style={{ background: '#fff', borderRadius: 40 }}
							disabled={loading.event}
							value={date}
							onChange={onChangeFilter('date')}
						/>
					</Flex>
					<Flex className={classes.distance}>
						<CSelect
							isMaxRadius
							isWhite
							style={{ background: '#fff', borderRadius: 40 }}
							disabled={loading.event}
							value={radius}
							options={radiusOpts}
							placeholder="Choose distance"
							prefix={<MarkIcon />}
							onChange={onChangeFilter('radius')}
						/>
					</Flex>
				</Flex>
				<Flex className={classes.categoryWrapper}>
					{typeEvent.map((item) => {
						const { value, label } = item
						return (
							<Flex
								key={value}
								className={clsx(classes.categoryItem, {
									[classes.categoryActive]: (categories || []).includes(value),
									[classes.disabled]: loading.event,
								})}
								onClick={() =>
									!loading.event && onChangeFilter('categories')(value)
								}
							>
								{label}
							</Flex>
						)
					})}
				</Flex>
			</Flex>
		)
	}
	const _renderHangout = () => {
		const { is_open_hangout, title_open_hangout } = userData
		return (
			<Flex vertical className={classes.hangout}>
				<Flex className={classes.titleHangoutHeaderRow}>
					<Flex
						className={clsx(classes.titleHangout, classes.titleHangoutHeader)}
						onClick={() => onChangeRoute(mainRoutes.hangout)}
					>
						<Party fill="#006B35" />
						<span className={classes.title}>Available now</span>
					</Flex>
					<CButtonCreate onClick={handleGoOnline} disabled={loadingContext}>
						Go online
					</CButtonCreate>
				</Flex>
				<Flex className={classes.contentHangout} vertical>
					{loadingProfile ? (
						<Skeleton.Input active className={classes.skeleton} />
					) : (
						<>
							<Flex
								vertical
								gap="4px"
								onClick={() => onChangeRoute(mainRoutes.hangout)}
							>
								<Flex className={classes.hangoutPeople}>
									{hangoutPeople.map((people) => (
										<div key={people.id}>
											<CAvatar
												src={people.avatar}
												style={{ width: 48, height: 48 }}
											/>
										</div>
									))}
								</Flex>
								<Flex className={classes.titleHangout}>
									<Flex className={classes.switchStatus}>
										<span
											style={{
												fontStyle: 'medium',
												fontSize: '14px',
												fontWeight: 500,
												lineHeight: '16px',
												color: '#0F1729',
											}}
										>
											<span style={{ color: '#1B8024' }}>
												{totalHangout + Number(is_open_hangout)}
											</span>{' '}
											people are ready to talk and meet.{' '}
											<span
												role="button"
												tabIndex={0}
												onClick={handleGoOnline}
												onKeyDown={(e) => {
													if (e.key === 'Enter' || e.key === ' ')
														handleGoOnline()
												}}
												style={{ color: '#E55A0F', cursor: 'pointer' }}
											>
												Go online
											</span>{' '}
											so they can see you.
										</span>
									</Flex>
								</Flex>
							</Flex>
						</>
					)}
				</Flex>
			</Flex>
		)
	}
	const _renderMyEvent = () => {
		const type = mainRoutes.event
		return (
			<Flex vertical className={classes.myEventWrapper}>
				<Flex
					className={classes.title}
					onClick={() => onChangeRoute(mainRoutes.event)}
				>
					<EventTitle
						label={mappingEventTitle[type] || type}
						number={totalMyEvent}
						labelCreateBtn="Create activity"
						icon={<EventIcon />}
						onAddNew={(e) => {
							e?.stopPropagation?.()
							onCheckEmail('event')
						}}
					/>
				</Flex>
				<Flex
					ref={_childRef}
					className={classes.wrapperItem}
					onScroll={onScroll}
				>
					{listMyEvent.map((data) => (
						<ItemEventTicket key={data.id} data={data} type={type} />
					))}
					{loadingMyEvent &&
						arrayFrom(3).map((_, index) => (
							<Skeleton.Input
								key={index}
								active
								className={classes.contentSkeleton}
							/>
						))}
					{!loadingMyEvent && !isArray(listMyEvent, 1) && (
						<Flex className={classes.notData} vertical>
							<EventIcon fill="#1e9037" />
							<span className={classes.labelNoData}>
								You haven't joined any activities yet !
							</span>
							<CButton
								ctype="oranger"
								onClick={() => onChangeRoute(`${mainRoutes.search}`)}
							>
								Explore now
							</CButton>
						</Flex>
					)}
				</Flex>
			</Flex>
		)
	}
	const _renderMyCommunity = () => {
		return (
			<Flex vertical className={classes.myCommunityWrapper}>
				<Flex
					className={classes.title}
					onClick={() => onChangeRoute(mainRoutes.community)}
				>
					<EventTitle
						label="My community"
						number={total.network}
						labelCreateBtn="Create community"
						icon={<People />}
						onAddNew={(e) => {
							e?.stopPropagation?.()
							onCheckEmail('network')
						}}
					/>
				</Flex>
				<Flex vertical className={classes.myCommunity}>
					{!(!loading.network && !isArray(listNetwork, 1)) && (
						<>
							<Flex
								className={classes.communityText}
								onClick={() => onChangeRoute(mainRoutes.exploreInterest)}
							>
								<div>Explore people and communities by interests</div>
								<div>
									<SearchIcon fill="#006B35" />
								</div>
							</Flex>
							<Flex className={classes.communityList}>
								{loading.network
									? arrayFrom(3).map((_, index) => (
											<Flex
												key={index}
												vertical
												className={classes.communityItem}
											>
												<Skeleton.Avatar
													active
													className={classes.contentSkeletonAva}
												/>
												<Skeleton.Input
													active
													className={classes.contentSkeletonInput}
												/>
											</Flex>
										))
									: isArray(listNetwork, 1) &&
										listNetwork.map((i) => {
											const { id, avatar, userRole, title } = i || {}
											return (
												<Flex
													key={id}
													vertical
													className={classes.communityItem}
													onClick={() =>
														onChangeRoute(`${mainRoutes.community}/${id}`)
													}
												>
													<div>
														<CAvatarBandage
															isHidden={userRole !== 'OWNER'}
															src={avatar}
															className={classes.communityAva}
															classBandage={classes.communityBandage}
														/>
													</div>
													<div className={classes.communityLabel}>{title}</div>
												</Flex>
											)
										})}
							</Flex>
						</>
					)}
					{!loading.network && !isArray(listNetwork, 1) && (
						<Flex className={classes.notData} vertical>
							<PeopleSmileIcon />
							<span className={classes.labelNoData}>
								Find your first network !
							</span>
							<CButton
								ctype="oranger"
								onClick={() => onChangeRoute(`${mainRoutes.search}`)}
							>
								Explore now
							</CButton>
						</Flex>
					)}
				</Flex>
			</Flex>
		)
	}
	const _renderChatRoomLanguageList = () => {
		if (!loading.chatroom && !isArray(listChatRoom, 1)) return null

		return (
			<Flex className={classes.chatRoomList}>
				{loading.chatroom
					? arrayFrom(10).map((_, index) => (
							<Flex key={index} vertical className={classes.chatRoomItem}>
								<Skeleton.Avatar
									active
									className={classes.contentSkeletonAva}
								/>
								<Skeleton.Input
									active
									className={classes.contentSkeletonInput}
								/>
								<Skeleton.Input
									active
									className={classes.contentSkeletonInput2}
								/>
							</Flex>
						))
					: isArray(listChatRoom, 1) &&
						listChatRoom.map((i) => {
							const {
								id,
								avatar,
								title,
								amount_of_user,
								amount_of_user_online,
							} = i || {}
							return (
								<Flex
									key={id}
									vertical
									className={classes.chatRoomItem}
									onClick={() =>
										onChangeRoute(
											`${mainRoutes.chatRoom}?type=language&id=${id}`,
										)
									}
								>
									<div>
										<CAvatarBandage
											isHidden
											src={avatar}
											className={clsx(classes.chatRoomAva, {
												[classes.leftFlag]: !!LEFT_FLAG[title],
											})}
											classBandage={classes.chatRoomBandage}
										/>
									</div>
									<div className={classes.chatRoomLabel}>{title}</div>
									<div className={classes.chatRoomNum}>
										{formatNumberString(amount_of_user)} members
									</div>
									<Flex className={classes.totalOnl}>
										<div className={classes.online} />
										<div>
											{formatNumberString(amount_of_user_online)} members online
										</div>
									</Flex>
								</Flex>
							)
						})}
			</Flex>
		)
	}

	const _renderChatRoomLocationList = () => {
		if (!loading.chatlocation && !isArray(listChatlocation, 1)) return null

		return (
			<Flex className={classes.chatLocationList}>
				{loading.chatlocation
					? arrayFrom(6).map((_, index) => (
							<Flex key={index} vertical className={classes.chatLocationItem}>
								<Skeleton.Input
									active
									className={classes.chatLocationSkeletonTitle}
								/>
								<Skeleton.Avatar
									active
									className={classes.chatLocationSkeletonAva}
								/>
								<Skeleton.Input
									active
									className={classes.chatLocationSkeletonMeta}
								/>
							</Flex>
						))
					: isArray(listChatlocation, 1) &&
						listChatlocation.map((item) => {
							const {
								id,
								title,
								avatars = [],
								amount_of_user,
								amount_of_user_online,
								last_message,
							} = item || {}
							const visibleAvatars = (avatars || []).slice(0, 3)
							const moreCount = Math.max(
								(amount_of_user || 0) - (avatars || []).length,
								0,
							)
							const lastMessageAt = last_message?.created_at
							const { value: timeAgo, unit } = lastMessageAt
								? getDiffFromNow({ input: lastMessageAt })
								: { value: '', unit: '' }

							return (
								<Flex
									key={id}
									vertical
									className={classes.chatLocationItem}
									onClick={() =>
										onChangeRoute(
											`${mainRoutes.chatRoom}?type=location&id=${id}`,
										)
									}
								>
									<Flex className={classes.chatLocationTitle}>
										<span className={classes.chatLocationGlobe}>
											<GlobalIcon fill="#006b35" width={12} height={12} />
										</span>
										<span className={classes.chatLocationName}>{title}</span>
									</Flex>
									<Flex className={classes.chatLocationAvatars}>
										<Flex className={classes.chatLocationAvatarStack}>
											{visibleAvatars.map((src, index) => (
												<div
													key={`${id}-avatar-${index}`}
													className={classes.chatLocationAvatar}
												>
													<CAvatar src={src} size={24} />
												</div>
											))}
										</Flex>
										{moreCount > 0 && (
											<span className={classes.chatLocationMore}>
												+{formatNumberString(moreCount)}
											</span>
										)}
									</Flex>
									<Flex vertical className={classes.chatLocationMeta}>
										<Flex className={classes.chatLocationOnline}>
											<span className={classes.chatLocationOnlineDot} />
											<span>
												{formatNumberString(amount_of_user_online || 0)} online
											</span>
										</Flex>
										{lastMessageAt && (
											<span className={classes.chatLocationTime}>
												{timeAgo}
												{unit ? ` ${unit}s ago` : ''}
											</span>
										)}
									</Flex>
								</Flex>
							)
						})}
			</Flex>
		)
	}

	const _renderChatRoom = () => {
		const isLocationTab = chatRoomTab === 'location'

		return (
			<Flex vertical className={classes.chatRoomWrapper}>
				<Flex
					className={classes.title}
					onClick={() => onChangeRoute(mainRoutes.chatRoom)}
				>
					<EventTitle hiddenAdd label="Chat room" icon={<Message2Icon />} />
				</Flex>
				<Flex vertical className={classes.chatRoom}>
					<Flex className={classes.chatRoomTabs}>
						<div
							className={clsx(classes.chatRoomTab, {
								[classes.chatRoomTabActive]: !isLocationTab,
							})}
							onClick={() => handleChatRoomTabClick('language')}
						>
							Language chat ({total.chatroom})
						</div>
						<div
							className={clsx(classes.chatRoomTab, {
								[classes.chatRoomTabActive]: isLocationTab,
							})}
							onClick={() => handleChatRoomTabClick('location')}
						>
							Location chat ({totalChatlocation})
						</div>
					</Flex>
					{isLocationTab
						? _renderChatRoomLocationList()
						: _renderChatRoomLanguageList()}
				</Flex>
			</Flex>
		)
	}
	const _renderModal = () => {
		const { type, data } = modal || {}
		let Content = <></>
		const propsModal = {
			open: true,
			onClose: () => setModal({ type: null, data: null }),
			onSuccess: (item) => onCRUDSuccess({ key: 'create', value: item }),
		}
		switch (type) {
			case 'event':
				Content = <ModalCRUDEvent {...propsModal} />
				break
			case 'network':
				Content = (
					<ModalCRUDCommunity
						{...propsModal}
						onSuccess={(item) =>
							onCRUDSuccess({ key: 'createNetwork', value: item })
						}
					/>
				)
				break
			case 'choose':
				Content = (
					<ModelChooseHangout
						data={data?.title_open_hangout || ''}
						onClose={() => setModal(null)}
						onSubmit={OnChangeTitleHangout}
					/>
				)
				break
			default:
				break
		}
		return Content
	}
	const _renderTalRoomOverview = () => {
		return (
			<Flex vertical className={classes.talkRoomWrapper}>
				<Flex
					className={classes.title}
					onClick={() => onChangeRoute(mainRoutes.talkroom)}
				>
					<EventTitle
						label="Talk room"
						number={totalTalkroom}
						labelCreateBtn="Create talk room"
						icon={<MicroPhoneIcon />}
						onAddNew={handleOpenCreateTalkRoomModal}
					/>
				</Flex>
				<Flex className={classes.statsTalkroom}>
					<div className={classes.statsItem}>
						<LiveIcon />
						<div className={classes.statsItemLabel}>
							Live: {statsTalkroom?.live_rooms_count}
						</div>
					</div>
					<div className={classes.statsItem}>
						<CalendarIcon fill="#1B8024" width={16} height={16} />
						<div className={classes.statsItemLabel}>
							Scheduled: {statsTalkroom?.scheduled_rooms_count}
						</div>
					</div>
					<div
						className={classes.statsItemJoining}
						onClick={() => handleOpenModalSoundQuality()}
					>
						<div className={classes.statsJoiningItemLabel}>
							Joining: {statsTalkroom?.total_count_me_in_in_scheduled_rooms}
						</div>
					</div>
				</Flex>
				<Flex vertical className={classes.talkRoom}>
					{!loading.talkroom && totalTalkroom === 0 ? (
						<Flex
							className={classes.talkRoomEmptyWrapper}
							vertical
							align="center"
							onClick={() => handleOpenCreateTalkRoomModal()}
						>
							<img
								src="/images/emptyRoom.png"
								alt=""
								className={classes.talkRoomEmptyImage}
							/>
							<span className={classes.talkRoomEmptyLabel}>
								Start a Talk Room
							</span>
						</Flex>
					) : (
						<Flex className={classes.talkRoomListWrapper}>
							{loading.talkroom
								? arrayFrom(5).map((_, index) => (
										<Flex
											key={index}
											vertical
											className={classes.talkRoomItemSkeleton}
										>
											<Skeleton.Avatar
												active
												className={classes.talkRoomSkeletonAvatar}
											/>
											<Skeleton.Input
												active
												className={classes.talkRoomSkeletonTag}
											/>
											<Skeleton.Input
												active
												className={classes.talkRoomSkeletonStatus}
											/>
										</Flex>
									))
								: isArray(listTalkroom, 1) &&
									listTalkroom.map((room) => (
										<TalkRoomCard
											key={room.id}
											room={room}
											onClick={() => handleOpenTalkRoomJoinModal(room.id)}
											onAvatarClick={(userId) =>
												onChangeRoute(`${mainRoutes.profile}/${userId}`)
											}
										/>
									))}
						</Flex>
					)}
				</Flex>
			</Flex>
		)
	}
	return (
		<div className={classes.wrapper} ref={_parentRef}>
			<Flex
				className={classes.container}
				vertical
				ref={_childRefUp}
				onScroll={onScrollUp}
			>
				{_renderHangout()}
				{_renderChatRoom()}
				{_renderTalRoomOverview()}
				{_renderMyCommunity()}
				{_renderMyEvent()}
				<Flex className={classes.wrapperUp} vertical>
					<Flex
						className={classes.title}
						onClick={() => onChangeRoute(mainRoutes.upcomingEvent)}
					>
						<EventTitle
							hiddenAdd
							label={mappingEventTitle[mainRoutes.upcomingEvent]}
							number={total.event}
							icon={<UpcomingEvent />}
						/>
					</Flex>
					{_renderFilter()}

					<Flex className={classes.wrapperItemUp}>
						{listPost.map((data) => (
							<ItemEvent
								key={data.id}
								data={data}
								type={mainRoutes.upcomingEvent}
							/>
						))}
						{loading.event &&
							arrayFrom(3).map((_, index) => (
								<Skeleton.Input
									key={index}
									active
									className={classes.contentBody}
								/>
							))}
						{!loading.event && !isArray(listPost, 1) && (
							<Flex className={classes.eventNotFound} vertical>
								<NotFound />
								<span className={classes.eventNotFoundTitle}>
									No activities here yet
								</span>
								<span className={classes.eventNotFoundLabel}>
									Try another location or create a meetup to bring people
									together.
								</span>
							</Flex>
						)}
					</Flex>
				</Flex>
			</Flex>
			{_renderModal()}
			<ModalTalkRoomWelcome
				open={talkRoomJoinModal.open}
				onClose={handleCloseTalkRoomJoinModal}
				onConfirm={handleConfirmTalkRoomWelcome}
			/>
			{talkRoomRuleModal.open && (
				<ModalNotiChatRoom
					open
					onClose={handleCloseTalkRoomRuleModal}
					onSubmit={handleConfirmTalkRoomJoin}
				/>
			)}
			<ModalTalkRoomSoundQuality
				open={modalSoundQuality.open}
				onClose={handleCloseModalSoundQuality}
				onConfirm={handleConfirmSoundQuality}
			/>
			{createTalkRoomModal.open && (
				<ModalCreateTalkRoom
					open
					onClose={handleCloseCreateTalkRoomModal}
					onSuccess={onRefreshTalkroomOverview}
					onInstantRoomCreated={handleInstantRoomCreated}
				/>
			)}
			{!!checkmail?.open && (
				<CheckEmail
					onSubmit={() => {
						onCheckMailSubmit()
					}}
					onClose={() => setCheckmail({ open: false, type: null })}
				/>
			)}
		</div>
	)
}

export default memo(Overview)
