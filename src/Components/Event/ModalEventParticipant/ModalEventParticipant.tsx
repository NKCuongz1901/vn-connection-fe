import React, { memo } from 'react'
import Link from 'next/link'
import { Flex, Skeleton } from 'antd'

import useModalEventParticipant from '@/hooks/Event/useModalEventParticipant'

import { arrayFrom } from '@/ultis/array.ults'
import { useLocalePath } from '@/ultis/route.ults'

import classes from './ModalEventParticipant.module.scss'
import CModal from '@/Components/Custom/CModal/CModal'
import CAvatar from '@/Components/Custom/CAvatar'

import { mainRoutes } from '@/routes/MainRoutes'
import { stateFriends } from '@/Variable/common.variable'
import ProfileFriendPlus from '@/svg/ProfileFriendPlus'
import ProfileFriend from '@/svg/ProfileFriend'
import ProfileTick from '@/svg/FriendSvg/ProfileTick'
import { getUserInfo } from '@/ultis/storage.ults'

interface ModalEventParticipantProps {
	id: string
	onClose?: any
}

const ModalEventParticipant = (_props: ModalEventParticipantProps) => {
	const { id, onClose } = _props
	const { onGetPath } = useLocalePath()
	const {
		loading,
		_parentRef,
		_childRef,
		participantList,
		total,
		onScroll,
		onAddFriend,
		onRemoveFriend,
		onOpenModalRemoveFriend,
	} = useModalEventParticipant({ id })
	const { id: idMe } = getUserInfo()
	const _renderStatusFriend = (item) => {
		const { is_friend } = item || {}

		const { state } = is_friend || {}
		switch (state) {
			case stateFriends.PENDING:
				return (
					<div
						className={classes.statusFriend}
						onClick={() => onRemoveFriend(item)}
					>
						<ProfileFriend />
					</div>
				)
			case stateFriends.ACCEPTED:
				return (
					<div
						className={classes.statusFriend}
						onClick={() => onOpenModalRemoveFriend(item)}
					>
						<ProfileTick fill="#E55A0F" />
					</div>
				)
			default:
				return (
					<div
						className={classes.statusFriend}
						onClick={() => onAddFriend(item)}
					>
						<ProfileFriendPlus />
					</div>
				)
		}
	}
	return (
		<CModal
			onClose={onClose}
			onCancel={onClose}
			title={`Participants (${total})`}
			styles={{
				content: {
					width: 800,
				},
			}}
			footer={[<div key="back"></div>]}
		>
			<div className={classes.wrapper}>
				<Flex vertical>
					<Flex
						className={classes.participantListWrapper}
						vertical
						ref={_parentRef}
					>
						<Flex
							vertical
							className={classes.participantList}
							ref={_childRef}
							onScroll={onScroll}
						>
							{participantList.map((item: any) => {
								const { user, id, user_id } = item || {}

								const { avatar, name } = user || {}
								const isMe = user_id === idMe
								return (
									<Flex key={id} className={classes.participantItem}>
										<Link
											href={onGetPath(`${mainRoutes.profile}/${user_id}`)}
											target="_blank"
										>
											<Flex className={classes.left}>
												<CAvatar src={avatar} />
												<span className={classes.name}>{name}</span>
											</Flex>
										</Link>
										{!isMe && _renderStatusFriend(item)}
									</Flex>
								)
							})}
							{loading &&
								arrayFrom(3).map((_, index) => (
									<Skeleton.Input
										key={index}
										active
										className={classes.contentBody}
									/>
								))}
						</Flex>
					</Flex>
				</Flex>
			</div>
		</CModal>
	)
}

export default memo(ModalEventParticipant)
