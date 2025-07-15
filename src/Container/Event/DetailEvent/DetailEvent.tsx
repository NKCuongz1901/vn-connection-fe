'use client'
import {
	IconCalendarWeekFilled,
	IconChevronLeft,
	IconClockFilled,
	IconDots,
	IconEdit,
	IconGlassCocktail,
	IconMapPinFilled,
	IconRepeat,
	IconShare3,
	IconTicket,
} from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import { memo } from 'react'

import { useLoading } from '@/context/LoadingContext'
import useDetailEvent from '@/hooks/Event/useDetailEvent'

import { cloneDeep } from '@/ultis/common.ults'
import { getDateInfo } from '@/ultis/date.ults'
import { isEmptyObject } from '@/ultis/object.ults'
import { goToGoogleMap, useSafeBack } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'
import { formatNumberString } from '@/ultis/string.ults'

import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import CModalSelect from '@/Components/Custom/CModal/CModalSelect'
import EventCoHost from '@/Components/Event/EventCoHost'
import EventComment from '@/Components/Event/EventComment'
import EventParticipant from '@/Components/Event/EventParticipant'
import ModalCRUDEvent from '@/Components/Event/ModalCRUDEvent'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
import GroupPeopleIcon from '@/svg/Event/GroupPeopleIcon'
import GroupPeopleJoinIcon from '@/svg/Event/GroupPeopleJoinIcon'

import { mainRoutes } from '@/routes/MainRoutes'
import { repeatOpt, ticketEntranceType } from '@/Variable/select.variable'

import classes from './DetailEvent.module.scss'

const skeletonItems = [
	{ id: '2', value: 333 },
	{ id: '1', value: 250 },
	{ id: '3', value: 100 },
]

interface DetailEventProps {
	id: string
	type?: string
	[key: string]: any
}
const DetailEvent = ({ id, type }: DetailEventProps) => {
	const {
		_refKeyEventParticipant,
		detailPost,
		loading,
		loadingShare,
		shareList,
		postMenus,
		editMenus,
		openModal,
		onCancelEvent,
		onSetOpenModal,
		onJoinPostConfirm,
		onShareFriend,
		onGetDetailPost,
		onCopy,
	} = useDetailEvent({ id })
	const { detailLoad } = loading
	const { loadingContext } = useLoading()
	const { goBackOrPush } = useSafeBack()
	const _renderSkeleton = () => {
		return (
			<Flex className={classes.container} vertical>
				{skeletonItems.map((i) => (
					<Skeleton.Input
						key={i.id}
						active
						className={classes.contentBody}
						style={{ width: '100%', height: i.value }}
					/>
				))}
			</Flex>
		)
	}
	const _renderAction = () => {
		return (
			<Flex className={classes.action}>
				<Flex
					className={classes.icon}
					onClick={() => goBackOrPush(type || mainRoutes.event)}
				>
					<IconChevronLeft />
				</Flex>
				<Flex className={classes.icon}>
					<Dropdown trigger={['click']} menu={{ items: postMenus }}>
						<IconDots style={{ cursor: 'pointer' }} />
					</Dropdown>
				</Flex>
			</Flex>
		)
	}
	const _renderInfo = () => {
		const {
			title,
			ticket_entrance,
			ticket_entrance_type,
			menu_price,
			is_joined,
			user_id,
			repeat_type,
			amount_of_participant,
			limit_participant,
		} = detailPost || {}
		const { type } = repeat_type || {}
		const id = getUserInfo('id')
		const isHost = id === user_id
		const isRepeat = type !== repeatOpt[0].value
		const isFull = amount_of_participant + 1 >= limit_participant
		let ticketValue = ''
		const [minEntr, maxEntr] = (ticket_entrance || '').split(':')
		switch (ticket_entrance_type) {
			case ticketEntranceType.ONLY:
				ticketValue = formatNumberString(minEntr) + 'đ'
				break
			case ticketEntranceType.MULTIPLE_TICKET:
				ticketValue = `${formatNumberString(minEntr)} đ - ${formatNumberString(
					maxEntr,
				)} đ`
				break
			case ticketEntranceType.FREE:
			default:
				ticketValue = 'Free'
				break
		}
		return (
			<Flex className={classes.info} vertical>
				<Flex className={classes.title}>
					<div className={classes.titleLabel}>{title}</div>
					<Flex className={classes.btn}>
						{isHost ? (
							isRepeat ? (
								<Dropdown trigger={['click']} menu={{ items: editMenus }}>
									<CButton
										ctype="disabled"
										disabled={loadingContext}
										icon={<IconEdit />}
									>
										Edit event
									</CButton>
								</Dropdown>
							) : (
								<CButton
									ctype="disabled"
									disabled={loadingContext}
									icon={<IconEdit />}
									onClick={() =>
										onSetOpenModal({ type: 'edit', dataModal: detailPost })
									}
								>
									Edit event
								</CButton>
							)
						) : is_joined ? (
							<CButton
								ctype="disabled"
								disabled={loadingContext}
								icon={<GroupPeopleJoinIcon fill="#006B35" />}
								onClick={() => onJoinPostConfirm('leave')}
							>
								Interested
							</CButton>
						) : isFull ? (
							<CButton ctype="oranger" disabled={true}>
								Full
							</CButton>
						) : (
							<CButton
								ctype="oranger"
								disabled={loadingContext}
								icon={<GroupPeopleJoinIcon />}
								onClick={() => onJoinPostConfirm('join')}
							>
								Interested
							</CButton>
						)}
						<CButton
							ctype="success"
							icon={<IconShare3 />}
							onClick={() => onSetOpenModal({ type: 'share' })}
						>
							Invite friend
						</CButton>
					</Flex>
				</Flex>
				<Flex className={classes.price}>
					<Flex className={classes.entr} vertical>
						<Flex>
							<IconTicket />
							<div>Entrance fee</div>
						</Flex>
						<div>{ticketValue}</div>
					</Flex>
					<Flex className={classes.entr} vertical>
						<Flex>
							<IconGlassCocktail />
							<div>Pricing menu</div>
						</Flex>
						<div>
							{menu_price
								? menu_price
										.split(':')
										.map((i) => formatNumberString(i) + 'đ')
										.join(' - ')
								: 'No'}
						</div>
					</Flex>
				</Flex>
			</Flex>
		)
	}
	const _renderTop = () => {
		const { thumbnails, repeat_type } = detailPost || {}
		const { type } = repeat_type || {}
		const isRepeat = type !== repeatOpt[0].value
		return (
			<Flex className={classes.top} vertical>
				{_renderAction()}
				<Flex className={classes.image}>
					<CImage src={thumbnails?.[0] || ''} />
				</Flex>
				{isRepeat && (
					<Flex className={classes.repeat}>
						<IconRepeat className={classes.iconRepeat} />
						<span>Repeated event</span>
					</Flex>
				)}
				{_renderInfo()}
			</Flex>
		)
	}
	const _renderDetail = () => {
		const {
			user,
			limit_participant,
			start_time,
			end_time,
			address_en,
			repeat_type,
			id,
			longitude,
			latitude,
		} = detailPost
		const {
			dmy: dmyStart,
			weekday: weekdayStart,
			time: timeStart,
		} = getDateInfo(Number(start_time))
		const {
			dmy: dmyEnd,
			weekday: weekdayEnd,
			time: timeEnd,
		} = getDateInfo(Number(end_time))
		const { type } = repeat_type || {}
		const typeRepeat =
			(repeatOpt.find((i) => i.value === type)?.label || '') + ','
		return (
			<Flex className={classes.detail} vertical>
				{id && <EventCoHost id={id} user={user} />}

				{id && (
					<EventParticipant id={id} key={_refKeyEventParticipant.current} />
				)}

				<Flex className={classes.detailInfo} vertical>
					<Flex className={classes.detailInfoItem}>
						<GroupPeopleIcon fill="#006B35" />
						<span>
							{formatNumberString(limit_participant)} attendees capacity
						</span>
					</Flex>
					<Flex className={classes.detailInfoItem}>
						<IconCalendarWeekFilled />
						<span>
							{weekdayStart}, {dmyStart} - {weekdayEnd}, {dmyEnd}
						</span>
					</Flex>
					<Flex
						className={classes.detailInfoItem}
						onClick={() => goToGoogleMap({ lat: latitude, lng: longitude })}
					>
						<IconMapPinFilled />
						<span>{address_en}</span>
					</Flex>
					<Flex className={classes.detailInfoItem}>
						<IconClockFilled />
						<span>
							{typeRepeat} {timeStart} - {timeEnd}
						</span>
					</Flex>
				</Flex>
			</Flex>
		)
	}
	const _renderDesc = () => {
		const { description } = detailPost
		return (
			<Flex className={classes.desc} vertical>
				<div className={classes.title}>Details</div>
				<div>{description}</div>
			</Flex>
		)
	}
	const _renderModal = () => {
		const { type, dataModal } = openModal
		let Content = <></>
		const propsModal = {
			open: true,
			onCancel: () => onSetOpenModal({}),
			onClose: () => onSetOpenModal({}),
			onCopy: onCopy,
			// onSuccess: onSuccess,
		}
		switch (type) {
			case 'cancel':
				{
					const options = [
						{
							value: 'ONLY_THIS_EVENT',
							label: 'Delete only this event',
							ctype: 'oranger',
						},
						{
							value: 'ALL',
							label: 'Delete all future event',
							ctype: 'disabled',
						},
					]
					Content = (
						<CModalSelect
							options={options}
							onChoose={onCancelEvent}
							{...propsModal}
						/>
					)
				}
				break
			case 'share':
				{
					Content = (
						<ModalMyFriend
							title="Invite friends"
							{...propsModal}
							customComp={_renderMyFriendComp}
						/>
					)
				}
				break
			case 'ALL':
			case 'ONLY_THIS_EVENT':
				{
					Content = (
						<ModalCRUDEvent
							{...propsModal}
							data={dataModal}
							edit_type={type}
							onSuccess={onGetDetailPost}
						/>
					)
				}
				break
			case 'edit':
				{
					Content = (
						<ModalCRUDEvent
							{...propsModal}
							data={dataModal}
							onSuccess={onGetDetailPost}
						/>
					)
				}
				break
			case 'extend':
				{
					const _dataModal = cloneDeep(dataModal)
					_dataModal.id = null
					Content = <ModalCRUDEvent {...propsModal} data={_dataModal} />
				}
				break
			default:
				break
		}
		return Content
	}
	const _renderMyFriendComp = (data: any) => {
		const { friend } = data || {}
		const { id } = friend || {}
		return (
			<div className={classes.btnShareFriend}>
				<CButton
					ctype="oranger"
					onClick={() => onShareFriend(id)}
					loading={loadingShare?.[id]}
					disabled={shareList?.[id]}
				>
					Invite
				</CButton>
			</div>
		)
	}
	return (
		<div className={classes.wrapper}>
			{detailLoad ? (
				_renderSkeleton()
			) : !isEmptyObject(detailPost) ? (
				<Flex className={classes.container} vertical>
					{_renderTop()}
					{_renderDetail()}
					{_renderDesc()}
					<Flex className={classes.comment}>
						<EventComment id={id} />
					</Flex>
					{_renderModal()}
				</Flex>
			) : (
				<Flex className={classes.noData}>Post does not exist</Flex>
			)}
		</div>
	)
}

export default memo(DetailEvent)
