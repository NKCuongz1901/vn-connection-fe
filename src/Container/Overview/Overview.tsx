import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import { useLoading } from '@/context/LoadingContext'
import useOverview from '@/hooks/Overview/useOverview'

import { arrayFrom, isArray } from '@/ultis/array.ults'
import { useLocalePath } from '@/ultis/route.ults'
import { formatNumberString } from '@/ultis/string.ults'

import ModalCRUDCommunity from '@/Components/Community/ModalCRUDCommunity'
import CAvatar from '@/Components/Custom/CAvatar'
import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import CButton from '@/Components/Custom/CButton'
import CDatePickerRanger from '@/Components/Custom/CDatePickerRanger'
import CInput from '@/Components/Custom/CInput'
import CSelect from '@/Components/Custom/CSelect'
import CSwitch from '@/Components/Custom/CSwitch'
import EventTitle from '@/Components/Event/EventTitle'
import ItemEvent from '@/Components/Event/ItemEvent'
import ItemEventTicket from '@/Components/Event/ItemEventTicket'
import ModalCRUDEvent from '@/Components/Event/ModalCRUDEvent'
import ModelChooseHangout from '@/Components/Hangout/ModelChooseHangout'
import EventIcon from '@/svg/Event'
import PencilIcon from '@/svg/Hangout/PencilIcon'
import MarkIcon from '@/svg/MarkIcon'
import Message2Icon from '@/svg/Message2Icon'
import NotFound from '@/svg/NotFound'
import Party from '@/svg/Party'
import People from '@/svg/People'
import PeopleSmileIcon from '@/svg/PeopleSmileIcon'
import SearchIcon from '@/svg/SearchIcon'

import { mainRoutes } from '@/routes/MainRoutes'
import { mappingEventTitle } from '@/Variable/event.variable'
import { radiusOpts, typeEvent } from '@/Variable/select.variable'

import classes from './Overview.module.scss'
import HappyIcon from '@/svg/HappyIcon'

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

		setModal,
		OnChangeTitleHangout,
		onUpdateUserInfo,
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
	} = useOverview()
	const _renderFilter = () => {
		const { radius, date, categories, title } = filters
		return (
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
				<Flex className={classes.distance}>
					<CSelect
						isMaxRadius
						isWhite
						style={{ background: '#fff', borderRadius: 40 }}
						disabled={loading.event}
						value={categories}
						options={typeEvent}
						placeholder="Categories"
						prefix={
							<Flex className={classes.prefixIcon}>
								<HappyIcon fill="#fff" />
							</Flex>
						}
						onChange={onChangeFilter('categories')}
					/>
				</Flex>
			</Flex>
		)
	}
	const _renderHangout = () => {
		const { is_open_hangout, title_open_hangout } = userData
		return (
			<Flex vertical className={classes.hangout}>
				<Flex
					className={clsx(classes.titleHangout, classes.titleHangoutHeader)}
					onClick={() => onChangeRoute(mainRoutes.hangout)}
				>
					<Party fill="#006B35" />
					<span className={classes.title}>Hangout</span>
				</Flex>
				<Flex className={classes.contentHangout} vertical>
					{loadingProfile ? (
						<Skeleton.Input active className={classes.skeleton} />
					) : (
						<>
							<Flex vertical gap="4px">
								<Flex className={classes.hangoutPeople}>
									{hangoutPeople.map((people) => (
										<div key={people.id}>
											<CAvatar src={people.avatar} />
										</div>
									))}
								</Flex>
								<Flex className={classes.switchStatus}>
									<span>
										{totalHangout + 1} People available to hangout now
									</span>
									<CSwitch
										value={is_open_hangout}
										disabled={loadingContext}
										ctype="success"
										onChange={(value) =>
											onUpdateUserInfo({ is_open_hangout: value })
										}
									/>
								</Flex>
							</Flex>
							<Flex
								className={classes.titleHangout}
								onClick={() => setModal({ type: 'choose', data: userData })}
							>
								<span>{title_open_hangout || 'I want to hang out'}</span>
								<Flex>
									<PencilIcon />
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
						icon={<EventIcon />}
						onAddNew={(e) => {
							e?.stopPropagation?.()
							setModal({ type: 'event', data: null })
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
						icon={<People />}
						onAddNew={(e) => {
							e?.stopPropagation?.()
							setModal({ type: 'network', data: null })
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
	const _renderChatRoom = () => {
		return (
			<Flex vertical className={classes.chatRoomWrapper}>
				<Flex
					className={classes.title}
					onClick={() => onChangeRoute(mainRoutes.chatRoom)}
				>
					<EventTitle
						hiddenAdd
						label="Chat room"
						number={total.chatroom}
						icon={<Message2Icon />}
					/>
				</Flex>
				<Flex vertical className={classes.chatRoom}>
					{!(!loading.chatroom && !isArray(listChatRoom, 1)) && (
						<>
							<Flex className={classes.chatRoomList}>
								{loading.chatroom
									? arrayFrom(10).map((_, index) => (
											<Flex
												key={index}
												vertical
												className={classes.chatRoomItem}
											>
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
											const { id, avatar, title, amount_of_user } = i || {}
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
															className={classes.chatRoomAva}
															classBandage={classes.chatRoomBandage}
														/>
													</div>
													<div className={classes.chatRoomLabel}>{title}</div>
													<div className={classes.chatRoomNum}>
														{formatNumberString(amount_of_user)} members
													</div>
												</Flex>
											)
									  })}
							</Flex>
						</>
					)}
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
							icon={<EventIcon />}
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
									No events here yet
								</span>
								<span className={classes.eventNotFoundLabel}>
									Try another location or create a meetup to bring people
									together.
								</span>
							</Flex>
						)}
					</Flex>
					{_renderModal()}
				</Flex>
			</Flex>
			{_renderModal()}
		</div>
	)
}

export default memo(Overview)
