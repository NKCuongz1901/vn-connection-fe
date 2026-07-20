'use client'
import { IconDots } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import clsx from 'clsx'

import DetailCommunityAdmin from '@/Components/Community/DetailCommunity/DetailCommunityAdmin'
import DetailCommunityAnnou from '@/Components/Community/DetailCommunity/DetailCommunityAnnou'
import DetailCommunityDiscussion from '@/Components/Community/DetailCommunity/DetailCommunityDiscussion'
import DetailCommunityMember from '@/Components/Community/DetailCommunity/DetailCommunityMember'
import ModalCRUDAnnoun from '@/Components/Community/DetailCommunity/ModalCRUDAnnoun'
import ModalCRUDCommunity from '@/Components/Community/ModalCRUDCommunity'
import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import ModalReport from '@/Components/Custom/ModalReport'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
import InboxChat from '@/Components/Inbox/InboxChat'
import useDetailCommunity from '@/hooks/Community/useDetailCommunity'
import ArrrowLeftIcon from '@/svg/ArrrowLeftIcon'
import ChatIcon from '@/svg/ChatIcon'
import People from '@/svg/People'
import TopicIcon from '@/svg/TopicIcon'

import classes from './DetailCommunity.module.scss'
import { getUserInfo, isLogin } from '@/ultis/storage'
import { REPORT_ISSUE_TYPE } from '@/Variable/common.variable'

const mappingTabsBtnTop = {
	member: 'member',
	topic: 'topic',
	chat: 'chat',
}

const tabsBtn = [
	{ value: mappingTabsBtnTop.member, label: 'Members' },
	{ value: mappingTabsBtnTop.topic, label: 'Topic' },
	{ value: mappingTabsBtnTop.chat, label: 'Chat' },
]

const mappingAboutTabsBtn = {
	about: 'about',
	annou: 'annou',
}
const aboutTabsBtn = [
	{ value: mappingAboutTabsBtn.about, label: 'About' },
	{ value: mappingAboutTabsBtn.annou, label: 'Announcement' },
]

const icons = {
	member: People,
	topic: TopicIcon,
	chat: ChatIcon,
}

interface DetailCommunityProps {
	id: string
	isPublic?: boolean
	onRequireLogin?: () => void
}
const DetailCommunity = (props: DetailCommunityProps) => {
	const { id, isPublic, onRequireLogin } = props
	const {
		discussionRef,
		memberRef,
		loadingConvInfo,
		loadingApi,
		loadingAnnou,

		convInfo,
		tabMiddle,
		annouList,
		total,
		modal,
		loadingShare,
		shareList,
		tabTop,

		menus,

		setTabTop,
		setModal,
		setShareList,
		setTabMiddle,
		onAction,
		onScroll,
		onCopy,
		onShareFriend,
		onGetMenus,
		onBack,
		onJoinConv,
	} = useDetailCommunity({ id, isPublic, onRequireLogin })

	const handleTabTopClick = (value: string) => {
		if (isPublic && !isLogin()) {
			onRequireLogin?.()
			return
		}
		setTabTop(value)
	}

	const _renderAction = () => {
		return (
			<Flex className={classes.action}>
				<Flex className={classes.icon} onClick={onBack}>
					<ArrrowLeftIcon />
				</Flex>
				<Flex className={classes.icon}>
					<Dropdown trigger={['click']} menu={{ items: menus }}>
						<IconDots style={{ cursor: 'pointer' }} />
					</Dropdown>
				</Flex>
			</Flex>
		)
	}
	const _renderInfo = () => {
		const { type, avatar, title, bio, address, host_id, join, country_code } =
			convInfo || {}
		const { type: typeJoin } = join || {}

		const isCreateAnnou =
			!isPublic &&
			(getUserInfo('id') === host_id || typeJoin === 'ADMIN')

		return (
			<Flex className={classes.infoWrapper}>
				<Flex className={classes.info}>
					<Flex vertical className={classes.avatarWrapper}>
						<CAvatar className={classes.avatar} src={avatar} />
						<Flex className={classes.type}>{type} </Flex>
					</Flex>
					<Flex className={classes.commonInfo} vertical>
						<div className={classes.name}>{title}</div>
						<div className={classes.address}>{bio || ''}</div>
						<Flex className={classes.address}>
							{!!country_code && (
								<div className={clsx(`flag:${country_code}`)} />
							)}
							{address}
						</Flex>
					</Flex>
				</Flex>
				<Flex className={classes.endButton}>
					{!(tabMiddle === mappingAboutTabsBtn.annou && !tabTop) ? (
						<>
							<CButton
								ctype="disabled"
								onClick={() => onAction({ key: 'share', value: convInfo })}
							>
								<span>Invite friends</span>
							</CButton>
							{(!join || isPublic) && (
								<CButton
									disabled={!!loadingApi.join}
									ctype="oranger"
									onClick={() => onJoinConv(id)}
								>
									Join
								</CButton>
							)}
						</>
					) : isCreateAnnou ? (
						<Flex>
							<CButton
								ctype="oranger"
								onClick={() =>
									setModal({
										type: 'addNewAnnou',
										data: {
											conversation_id: id,
										},
									})
								}
							>
								+ Create announcement
							</CButton>
						</Flex>
					) : (
						<>
							<CButton
								ctype="disabled"
								onClick={() => onAction({ key: 'share', value: convInfo })}
							>
								<span>Invite friends</span>
							</CButton>
							{(!join || isPublic) && (
								<CButton
									disabled={!!loadingApi.join}
									ctype="oranger"
									onClick={() => onJoinConv(id)}
								>
									Join
								</CButton>
							)}
						</>
					)}
				</Flex>
			</Flex>
		)
	}
	const _renderTabsBtn = () => {
		return (
			<Flex className={classes.renderTabsBtn}>
				{tabsBtn.map((tab) => {
					const { value, label } = tab
					const Icon = icons[value] || icons.member
					return (
						<Flex
							vertical
							key={value}
							className={clsx(classes.tab, {
								[classes.tabActive]: value === tabTop,
							})}
							onClick={() => handleTabTopClick(value)}
						>
							<Flex className={classes.tabIcon}>
								<Icon />
							</Flex>
							<div className={classes.tabLabel}>{label}</div>
						</Flex>
					)
				})}
			</Flex>
		)
	}
	const _renderTop = () => {
		const { thumbnail } = convInfo || {}
		if (loadingConvInfo) {
			return (
				<Flex className={classes.skeletonInfo}>
					<Skeleton.Input active className={classes.skeletonInput} />
				</Flex>
			)
		}
		return (
			<Flex className={classes.top} vertical>
				{_renderAction()}
				<Flex className={classes.image}>
					<CImage src={thumbnail || ''} />
				</Flex>

				{_renderInfo()}
				{_renderTabsBtn()}
			</Flex>
		)
	}

	const _renderAboutTabsBtn = () => {
		return (
			<Flex className={classes.renderTabsBtn}>
				{aboutTabsBtn.map((tab) => {
					const { value, label } = tab
					return (
						<Flex
							vertical
							key={value}
							className={clsx(classes.tab, {
								[classes.tabActive]: value === tabMiddle,
							})}
							onClick={() => setTabMiddle(value)}
						>
							<div className={classes.tabLabel}>
								{label}
								{value === mappingAboutTabsBtn.annou && (
									<span> ({total.annount || 0}) </span>
								)}
							</div>
						</Flex>
					)
				})}
			</Flex>
		)
	}
	const _renderAbout = () => {
		const { about } = convInfo || {}

		return <Flex className={classes.renderAbout}> {about}</Flex>
	}
	const _renderDetailCommunityAnnou = () => {
		return (
			<div className={classes.renderDetailCommunityAnnou}>
				<DetailCommunityAnnou
					loading={loadingAnnou}
					announceList={annouList || []}
					onGetMenus={onGetMenus}
					onAction={onAction}
					isPublic={isPublic}
					onRequireLogin={onRequireLogin}
				/>
			</div>
		)
	}
	const _renderMiddle = () => {
		const content = {
			[mappingAboutTabsBtn.about]: _renderAbout,
			[mappingAboutTabsBtn.annou]: _renderDetailCommunityAnnou,
		}
		return (
			<Flex className={classes.renderMiddle} vertical>
				{_renderAboutTabsBtn()}
				{content[tabMiddle]?.()}
			</Flex>
		)
	}

	const _renderFollowAbout = () => {
		const { category } = convInfo || {}
		return (
			<Flex
				vertical
				className={clsx(classes.renderFollowAbout, {
					[classes.followAboutHidden]: tabMiddle !== mappingAboutTabsBtn.about,
				})}
			>
				<DetailCommunityAdmin
					id={id}
					admins={convInfo?.admins}
					isPublic={isPublic}
					onRequireLogin={onRequireLogin}
				/>
				<Flex className={classes.category} vertical>
					<div className={classes.title}>Category</div>
					<div className={classes.categoryInfo}>{category}</div>
				</Flex>
			</Flex>
		)
	}
	const _renderMyFriendComp = (data) => {
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
					Send
				</CButton>
			</div>
		)
	}
	const _renderModal = () => {
		if (isPublic && !isLogin()) return null

		const { type, data, title } = modal || {}
		let Content = <></>
		const propsModal = {
			open: true,
			onCancel: () => {
				setModal({})
				setShareList({})
			},
			onClose: () => {
				setModal({})
				setShareList({})
			},
			onCopy: () => onCopy(data?.props?.share_link),
		}
		switch (type) {
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
			case 'report':
				Content = (
					<ModalReport
						reportType={REPORT_ISSUE_TYPE.TALKROOM}
						open
						{...propsModal}
						data={{ discuss_id: data?.id }}
						title={'Report'}
						message={title || 'You want to report this announcement ?'}
					/>
				)
				break
			case 'reportCommunity':
				Content = (
					<ModalReport
						reportType={REPORT_ISSUE_TYPE.TALKROOM}
						open
						{...propsModal}
						data={{ conversation_id: data?.id }}
						title={'Report'}
						message={title || 'You want to report this community?'}
					/>
				)
				break
			case 'addNewAnnou':
			case 'editAnnou':
				Content = (
					<ModalCRUDAnnoun
						{...propsModal}
						onSuccess={(item) => onAction({ key: type, value: item })}
						data={data}
					/>
				)
				break
			case 'editCommunity':
				Content = (
					<ModalCRUDCommunity
						{...propsModal}
						onSuccess={(item) => onAction({ key: type, value: item })}
						data={data}
					/>
				)
				break
			default:
				break
		}
		return Content
	}

	const _renderMember = () => {
		return (
			<div>
				<DetailCommunityMember id={id} ref={memberRef} info={convInfo} />
			</div>
		)
	}

	const _renderTopic = () => {
		return (
			<div>
				<DetailCommunityDiscussion id={id} ref={discussionRef} />
			</div>
		)
	}

	const _renderChat = () => {
		return (
			<div className={classes.renderChat}>
				<InboxChat convId={id} isNoHeader type="chatrom" />
			</div>
		)
	}
	const _renderTab = () => {
		switch (tabTop) {
			case mappingTabsBtnTop.member:
				return _renderMember()
			case mappingTabsBtnTop.topic:
				return _renderTopic()
			case mappingTabsBtnTop.chat:
				return _renderChat()
			default:
				return (
					<>
						{_renderMiddle()}
						{_renderFollowAbout()}
					</>
				)
		}
	}
	return (
		<div className={classes.wrapper}>
			<Flex
				className={classes.container}
				vertical
				onScroll={(e) => {
					switch (tabTop) {
						case mappingTabsBtnTop.topic:
							return discussionRef.current?.onLoadMore?.(e)
						default:
							onScroll(e)
					}
				}}
			>
				{_renderTop()}
				{_renderTab()}
				{_renderModal()}
			</Flex>
		</div>
	)
}

export default DetailCommunity
