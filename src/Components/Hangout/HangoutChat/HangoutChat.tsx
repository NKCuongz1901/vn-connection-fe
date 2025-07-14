import { GoogleMap, Marker } from '@react-google-maps/api'
import { IconCheck, IconMapPinFilled, IconX } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import Link from 'next/link'
import { memo } from 'react'

import { isArray } from '@/ultis/array.ults'
import { goToGoogleMap, onPushState, useLocalePath } from '@/ultis/route.ults'

import ChatBox from '@/Components/ChatBox'
import CAvatar from '@/Components/Custom/CAvatar'
import CGGMap from '@/Components/Custom/CGGMap/CGGMap'
import ModalReport from '@/Components/Custom/ModalReport'
import useHangoutChat from '@/hooks/Hangout/useHangoutChat'
import { mainRoutes } from '@/routes/MainRoutes'
import MoreIcon from '@/svg/MoreIcon'
import ModelChooseHangout from '../ModelChooseHangout'

import classes from './HangoutChat.module.scss'

const containerStyle = { width: '100%', height: '104px' }

const HangoutChat = ({ postId }) => {
	const { onGetPath } = useLocalePath()

	const {
		_scrollRef,
		commentList,
		hangoutInfo,
		loadingPage,
		loading,
		menus,
		modal,
		setModal,
		isLoaded,
		showGGmap,
		listParticipant,
		setShowGGmap,
		onSendMessage,
		onChangeTitleHangout,
		onEditLocation,
		onActionPart,
		onLoadMore,
	} = useHangoutChat({ postId })
	const { latitude, longitude } = hangoutInfo || {}

	if (loadingPage) {
		return (
			<div className={classes.hangoutChatWrapper}>
				<Flex className={classes.chatContainer} vertical>
					<Flex className={classes.title}>
						<Skeleton.Input active className={classes.skeleton} />
					</Flex>
					<Flex className={classes.title}>
						<Skeleton.Input active className={classes.skeleton} />
					</Flex>
					<Flex className={classes.chatContent} vertical>
						<Skeleton.Input active className={classes.skeleton} />
					</Flex>
				</Flex>
			</div>
		)
	}
	const _renderModal = () => {
		const { type, data } = modal || {}
		const { latitude, longitude } = data

		let content = <></>
		switch (type) {
			case 'choose':
				content = (
					<ModelChooseHangout
						data={data || ''}
						onClose={() => setModal(null)}
						onSubmit={onChangeTitleHangout}
					/>
				)
				break
			case 'location':
				content = (
					<CGGMap
                        title="Edit Location"
						latitude={latitude}
						longitude={longitude}
						onClose={() => setModal(null)}
						onSubmit={onEditLocation}
					/>
				)
				break
			case 'report':
				content = (
					<ModalReport
						open
						onClose={() => setModal(null)}
						data={data}
						message={'You want to report this hangout?'}
					/>
				)
				break
			default:
				break
		}
		return content
	}
	const _renderGGMap = () => {
		if (!isLoaded || showGGmap) return null
		return (
			<div className={classes.ggMap}>
				<GoogleMap
					center={{ lat: latitude, lng: longitude }}
					zoom={15}
					mapContainerStyle={containerStyle}
				>
					{<Marker position={{ lat: latitude, lng: longitude }} />}
				</GoogleMap>
			</div>
		)
	}
	const _renderListWaiting = () => {
		const { WAITING } = listParticipant || {}
		if (!isArray(WAITING, 1)) {
			return null
		}
		return (
			<Flex vertical className={classes.waitingWrapper}>
				{WAITING.map((item) => {
					const { user, id } = item as any
					return (
						<Flex key={id} className={classes.waitingItem}>
							<Flex className={classes.waitingItemLeft}>
								<CAvatar src={user?.avatar} />
								<span>{user?.name}</span>
								<span className={classes.opacityDown}>want to join</span>
							</Flex>
							<Flex className={classes.btnAction}>
								<Flex
									className={classes.iconCancel}
									onClick={() =>
										onActionPart({
											id: item?.id,
											request_join_status: 'REJECT',
										})
									}
								>
									<IconX />
								</Flex>
								<Flex
									className={classes.iconAccept}
									onClick={() =>
										onActionPart({
											id: item?.id,
											request_join_status: 'ACCEPT',
										})
									}
								>
									<IconCheck />
								</Flex>
							</Flex>
						</Flex>
					)
				})}
			</Flex>
		)
	}
	return (
		<div className={classes.hangoutChatWrapper}>
			<Flex className={classes.chatContainer} vertical>
				<Flex className={classes.header}>
					<div>{hangoutInfo?.title}</div>
					<Flex className={classes.action}>
						<Dropdown menu={{ items: menus }} trigger={['click']}>
							<Flex className={classes.iconMore}>
								<MoreIcon />
							</Flex>
						</Dropdown>
						<Flex className={classes.iconClose} onClick={() => onPushState({})}>
							X
						</Flex>
					</Flex>
				</Flex>
				<Flex className={classes.participants}>
					<Flex className={classes.avatars}>
						{hangoutInfo?.participants?.map((item) => (
							<Link
								key={item?.id}
								href={onGetPath(`${mainRoutes.profile}/${item?.user_id}`)}
								target="_blank"
							>
								<CAvatar key={item?.id} src={item?.user?.avatar} />
							</Link>
						))}
					</Flex>
					<Flex gap={4}>
						<Flex
							onClick={() => goToGoogleMap({ lat: latitude, lng: longitude })}
						>
							<IconMapPinFilled size={18} color="#006b35" cursor="pointer" />
						</Flex>
						<Flex onClick={() => setShowGGmap((pre) => !pre)}>
							Meeting point
						</Flex>
					</Flex>
				</Flex>
				{_renderGGMap()}
				{_renderListWaiting()}
				<Flex className={classes.chatBox}>
					<ChatBox
						itemList={commentList}
						loading={loading}
						onLoadMore={onLoadMore}
						_scrollRef={_scrollRef}
						onSendMessage={onSendMessage}
					/>
				</Flex>
				{modal?.type && _renderModal()}
			</Flex>
		</div>
	)
}

export default memo(HangoutChat)
