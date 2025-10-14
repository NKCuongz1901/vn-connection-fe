'use client'
import { IconDots } from '@tabler/icons-react'
import { Dropdown, Flex } from 'antd'
import clsx from 'clsx'

import DetailCommunityAdmin from '@/Components/Community/DetailCommunity/DetailCommunityAdmin'
import DetailCommunityAnnou from '@/Components/Community/DetailCommunity/DetailCommunityAnnou'
import ModalCRUDAnnoun from '@/Components/Community/DetailCommunity/ModalCRUDAnnoun'
import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import ModalReport from '@/Components/Custom/ModalReport'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
import useDetailCommunity from '@/hooks/Community/useDetailCommunity'
import ArrrowLeftIcon from '@/svg/ArrrowLeftIcon'
import ChatIcon from '@/svg/ChatIcon'
import People from '@/svg/People'
import TopicIcon from '@/svg/TopicIcon'

import classes from './DetailCommunity.module.scss'
import DetailCommunityDiscussion from '@/Components/Community/DetailCommunity/DetailCommunityDiscussion'

const mappingTabsBtnTop = {
	member: 'member',
	topic: 'topic',
	chat: 'chat',
}

const tabsBtn = [
	{ value: mappingTabsBtnTop.member, label: 'Members' },
	{ value: mappingTabsBtnTop.topic, label: 'Discussion' },
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
}
const DetailCommunity = (props: DetailCommunityProps) => {
	const { id } = props
	const {
		discussionRef,
		// loadingConvInfo,
		loadingAnnou,
		convInfo,
		tabMiddle,
		annouList,
		total,
		modal,
		loadingShare,
		shareList,
		tabTop,

		setTabTop,
		setModal,
		setShareList,
		setTabMiddle,
		onAction,
		onScroll,
		onCopy,
		onShareFriend,
		onGetMenus,
	} = useDetailCommunity(props)

	// const { join } = convInfo || {}

	const _renderAction = () => {
		return (
			<Flex className={classes.action}>
				<Flex
					className={classes.icon}
					// onClick={() => goBackOrPush(type || mainRoutes.event)}
				>
					<ArrrowLeftIcon />
				</Flex>
				<Flex className={classes.icon}>
					<Dropdown trigger={['click']} menu={{ items: [] }}>
						<IconDots style={{ cursor: 'pointer' }} />
					</Dropdown>
				</Flex>
			</Flex>
		)
	}
	const _renderInfo = () => {
		const { type, avatar, title, bio, address } = convInfo || {}

		return (
			<Flex className={classes.infoWrapper}>
				<Flex className={classes.info}>
					<Flex vertical className={classes.avatarWrapper}>
						<CAvatar className={classes.avatar} size={96} src={avatar} />
						<Flex className={classes.type}>{type} </Flex>
					</Flex>
					<Flex className={classes.commonInfo} vertical>
						<div className={classes.name}>{title}</div>
						<div className={classes.address}>{bio || ''}</div>
						<Flex className={classes.address}>{address}</Flex>
					</Flex>
				</Flex>
				{/* <Flex className={classes.endButton}>
						{isMe ? (
							<>
								<CButton
									ctype="oranger"
									style={{ height: 40 }}
									onClick={() => onChangeRoute(mainRoutes.search)}
								>
									<Flex>
										<ShareIcon />
									</Flex>
									<span>Invite friend</span>
								</CButton>
								<CButton
									ctype="disabled"
									style={{ height: 40 }}
									onClick={onOpenEditP}
								>
									Edit Profile
								</CButton>
							</>
						) : (
							<>
								{!isMinimize && _renderButtonFriend()}
								<CButton
									ctype="disabled"
									style={{ height: 40 }}
									onClick={onOpenInbox}
								>
									Inbox
								</CButton>
							</>
						)}
					</Flex> */}
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
							onClick={() => setTabTop(value)}
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
				/>
				<Flex
					className={classes.addNewAnnou}
					onClick={() =>
						setModal({
							type: 'addNewAnnou',
							data: {
								conversation_id: id,
							},
						})
					}
				>
					+
				</Flex>
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
				<DetailCommunityAdmin id={id} />
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
		const { type, data } = modal || {}
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
							title="Share friend"
							{...propsModal}
							customComp={_renderMyFriendComp}
						/>
					)
				}
				break
			case 'report':
				Content = (
					<ModalReport
						open
						{...propsModal}
						data={{ discuss_id: data?.id }}
						title={'Report'}
						message={'You want to report this announcement ?'}
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
			default:
				break
		}
		return Content
	}
	const _renderTopic = () => {
		return (
			<div>
				<DetailCommunityDiscussion id={id} ref={discussionRef} />
			</div>
		)
	}
	const _renderTab = () => {
		switch (tabTop) {
			case mappingTabsBtnTop.topic:
				return _renderTopic()
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
