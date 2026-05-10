import { IconBellFilled } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import useNotification from '@/hooks/Notification/useNotification'

import { arrayFrom } from '@/ultis/array'
import { getDiffFromNow } from '@/ultis/date'

import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import CButton from '@/Components/Custom/CButton'
import ModalDetailNoti from '@/Components/Notification/ModalDetailNoti/ModalDetailNoti'
import DoubleHeart from '@/svg/DoubleHeart'
import Event from '@/svg/Event'
import Message3 from '@/svg/Message3'
import Messenger from '@/svg/Messenger'
import Party from '@/svg/Party'
import People from '@/svg/People'
import MicroPhoneIcon from '@/svg/MicroPhoneIcon'

import { NOTIFICATION_TYPE, NotiTypes } from '@/Variable/select.variable'
import { NotiItemProp } from '@/interface/Notification/Notification.interface'

import classes from './Notification.module.scss'
import DoubleTick from '@/svg/DoubleTick'
import { SettingFilled } from '@ant-design/icons'
import ModalNotificationSetting from '@/Components/Notification/ModalNotificationSetting/ModalNotificationSetting'

const mappingTypeIcon = {
	EVENT: Event,
	[NOTIFICATION_TYPE.COMMENT_ON_EVENT]: Event,
	[NOTIFICATION_TYPE.COMMENT_ON_EVENT_WITH_MENTION]: Event,
	[NOTIFICATION_TYPE.LIKE_ON_EVENT]: Event,
	[NOTIFICATION_TYPE.JOIN_EVENT]: Event,
	[NOTIFICATION_TYPE.NOTIFICATION_EVENT_NEAR_BY_USER]: Event,
	[NOTIFICATION_TYPE.NEW_EVENT_CREATE_NEAR_BY_USER]: Event,
	[NOTIFICATION_TYPE.NOTIFICATION_LAST_EVENT_FOR_HOST]: Event,
	[NOTIFICATION_TYPE.REQUEST_DELETE_ONLY_THIS_EVENT]: Event,
	[NOTIFICATION_TYPE.REQUEST_DELETE_ALL_REPEAT_EVENT]: Event,
	[NOTIFICATION_TYPE.UPGRADE_TO_ADMIN_ONLY_THIS_EVENT]: Event,
	[NOTIFICATION_TYPE.UPGRADE_TO_ADMIN_ALL_REPEAT_EVENT]: Event,
	[NOTIFICATION_TYPE.EVENT_CANCELED_BY_HOST]: Event,

	DISCUSS_IN_CLUB: People,
	DISCUSS_IN_CHATROOM: People,
	CLUB: People,
	[NOTIFICATION_TYPE.CHAT_ROOM]: People,

	[NOTIFICATION_TYPE.COMMENT_ON_DISCUSS_IN_TOPIC]: Message3,
	[NOTIFICATION_TYPE.NEW_POST_CREATED]: Message3,
	[NOTIFICATION_TYPE.LIKE_ON_DISCUSS_IN_TOPIC]: Message3,
	[NOTIFICATION_TYPE.COMMENT_ON_DISCUSS_IN_CHATROOM]: Message3,
	[NOTIFICATION_TYPE.COMMENT_ON_DISCUSS_IN_CLUB]: Message3,
	DISCUSS_IN_TOPIC: Message3,

	[NOTIFICATION_TYPE.ADD_FRIEND]: Messenger,
	[NOTIFICATION_TYPE.ACCEPT_FRIEND]: Messenger,
	[NOTIFICATION_TYPE.MINI_CHAT]: Messenger,

	MATCH_DATING: DoubleHeart,
	CRUSH_DATING: DoubleHeart,

	[NOTIFICATION_TYPE.REQUEST_JOIN_HANGOUT]: Party,
	[NOTIFICATION_TYPE.ACCEPT_PARTICIPANT]: Party,
	[NOTIFICATION_TYPE.JOIN_HANGOUT]: Party,
	[NOTIFICATION_TYPE.NEAR_END_HANGOUT_STATUS]: Party,
	[NOTIFICATION_TYPE.COMMENT_ON_HANGOUT]: Party,
}
const Notification = (props: { onClose?: any }) => {
	const { onClose } = props || {}
	const {
		type,
		notiList,
		loading,
		modal,
		setModal,
		setType,
		onClickNoti,
		onScroll,
		onReadAllNoti,
		onGetNotificationSetting,
		notificationSetting,
		loadingNotificationSetting,
		onChangeStatusTypeNotification,
		onChangeAllStatusTypeNotification,
	} = useNotification({ onClose })

	const _renderHeader = () => {
		return (
			<Flex vertical className={classes.header}>
				<div className={classes.titleRow}>
					<div className={classes.title}>Notification</div>
					<div className={classes.settingRow}>
						<div className={classes.settingIconWrapper} onClick={onReadAllNoti}>
							<DoubleTick fill="#0F1729" />
						</div>
						<div
							className={classes.settingIconWrapper}
							onClick={() => setModal({ type: 'setting' })}
						>
							<SettingFilled />
						</div>
					</div>
				</div>

				<Flex className={classes.grpbtn}>
					{NotiTypes.map((item) => {
						const { value, label } = item
						return (
							<div className={classes.button} key={value}>
								<CButton
									ctype={type === value ? 'success' : 'disabled'}
									onClick={() => setType(value)}
								>
									{label}
								</CButton>
							</div>
						)
					})}
				</Flex>
			</Flex>
		)
	}

	const _renderBandage = (type) => {
		const Icon = mappingTypeIcon[type]
		return (
			<Flex className={classes.bandageIcon}>
				{Icon && <Icon fill={'#fff'} />}
			</Flex>
		)
	}

	const _renderItemContent = (item: NotiItemProp) => {
		const {
			id,
			image,
			extra_data,
			content,
			title,
			created_at,
			is_read,
			interacting_type,
		} = item || {}
		const { type, kind } = extra_data || {}
		const { value: timeAgo, unit } = getDiffFromNow({ input: created_at })
		return (
			<Flex key={id} className={classes.item} onClick={() => onClickNoti(item)}>
				<Flex className={classes.itemLeft}>
					<div>
						{![
							'PUSH_BY_ADMIN',
							'NEAR_END_HANGOUT_STATUS',
							'INVITEE_MEMBER_JOIN_CLUB',
							'JOIN_DISCUSSION_IN_CHATROOM',
							'FRIEND_JOINED_TALKROOM',
						].includes(interacting_type) ? (
							<div>
								<CAvatarBandage
									src={image || '/images/univini-logo.png'}
									className={classes.itemAvatar}
									classBandage={classes.bandage}
									customeBandage={_renderBandage(
										type || kind || interacting_type,
									)}
								/>
							</div>
						) : (
							<Flex className={classes.iconBell}>
								<MicroPhoneIcon fill="#E55A0F" />
							</Flex>
						)}
					</div>
					<Flex vertical className={classes.contentInfo}>
						<div className={classes.contentTitle}>{title}</div>
						<div className={classes.contentcontent}>{content}</div>
						<div className={classes.contentTime}>
							{timeAgo} {unit ? unit + 's ago' : ''}
						</div>
					</Flex>
				</Flex>
				<div
					className={clsx(classes.contentUnread, { [classes.hidden]: is_read })}
				></div>
			</Flex>
		)
	}

	const _renderSkeleton = () => {
		return (
			<Flex className={classes.skeletonWrapper} vertical>
				{arrayFrom(3).map((_, index) => (
					<Flex key={index} className={classes.skeletonContainer}>
						<Skeleton.Avatar active className={classes.skeletonAva} />
						<Skeleton.Input active className={classes.skeleton} />
					</Flex>
				))}
			</Flex>
		)
	}

	const _renderContent = () => {
		return (
			<Flex vertical className={classes.content} onScroll={onScroll}>
				{notiList.map((item) => _renderItemContent(item))}
				{loading && _renderSkeleton()}
			</Flex>
		)
	}
	const _renderModal = () => {
		const { type, data } = modal || {}
		let Content = <></>
		const propsModal = {
			open: true,
			onCancel: () => setModal({}),
			onClose: () => setModal({}),
			data,
		}
		switch (type) {
			case 'detail':
				Content = <ModalDetailNoti title="Notification" {...propsModal} />
				break
			case 'setting':
				Content = (
					<ModalNotificationSetting
						title="Notification Setting"
						{...propsModal}
						setting={notificationSetting}
						loading={loadingNotificationSetting}
						onToggle={(key, value) =>
							onChangeStatusTypeNotification({ [key]: value })
						}
						onToggleAll={(key, value) => {
							onChangeAllStatusTypeNotification({ [key]: value })
						}}
					/>
				)
				break
			default:
				break
		}
		return Content
	}
	return (
		<div
			className={classes.wrapper}
			onClick={(e) => {
				e.stopPropagation()
				e.preventDefault()
			}}
		>
			<Flex vertical className={classes.container}>
				{_renderHeader()}
				{_renderContent()}
				{_renderModal()}
			</Flex>
		</div>
	)
}

export default memo(Notification)
