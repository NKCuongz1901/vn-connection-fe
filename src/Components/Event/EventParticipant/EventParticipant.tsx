import { Flex, Skeleton } from 'antd'
import { memo } from 'react'

import useEventParticipant from '@/hooks/Event/useEventParticipant'

import { arrayFrom } from '@/ultis/array'
import { useLocalePath } from '@/ultis/route'

import CAvatar from '@/Components/Custom/CAvatar'
import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import GroupPeopleIcon from '@/svg/Event/GroupPeopleIcon'
import StarIcon from '@/svg/Event/StarIcon'
import ModalEventParticipant from '../ModalEventParticipant'

import { mainRoutes } from '@/routes/MainRoutes'

import classes from './EventParticipant.module.scss'

interface EventParticipant {
	id?: any
	isPublic?: boolean
	onRequireLogin?: () => void
}
const limit = 5
const EventParticipant = ({
	id,
	isPublic,
	onRequireLogin,
}: EventParticipant) => {
	const { onGetPath } = useLocalePath()
	const { loading, total, participantList, openModal, setOpenModal } =
		useEventParticipant({
			id,
			isPublic,
		})
	const _renderSkeleton = () => {
		return arrayFrom(3).map((_, id) => <Skeleton.Avatar key={id} />)
	}
	const _renderGroup = () => {
		return (
			<>
				{participantList?.slice(0, limit)?.map((item) => {
					const { isOnwer, isAdmin, user, id, user_id } = item || {}
					const { avatar } = user || {}
					const Content = isOnwer || isAdmin ? CAvatarBandage : CAvatar

					return (
						<div
							key={id}
							onClick={() => {
								if (isPublic) {
									onRequireLogin?.()
									return
								}
								window.open(
									onGetPath(`${mainRoutes.profile}/${user_id}`),
									'_blank',
								)
							}}
							style={{ cursor: 'pointer' }}
						>
							<Content
								src={avatar}
								{...(isAdmin && { customeBandage: <StarIcon /> })}
							/>
						</div>
					)
				})}

				{total > limit && (
					<Flex
						className={classes.moreMember}
						onClick={() => setOpenModal(true)}
					>
						<GroupPeopleIcon />
					</Flex>
				)}
			</>
		)
	}
	const _renderModal = () => {
		return (
			<ModalEventParticipant
				id={id}
				isPublic={isPublic}
				onRequireLogin={onRequireLogin}
				onClose={() => {
					setOpenModal(false)
				}}
			/>
		)
	}
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.participant} onClick={() => setOpenModal(true)}>
				<div className={classes.title}>Participants</div>
				<div>{total}</div>
			</Flex>
			<Flex className={classes.memberJoin}>
				{loading ? _renderSkeleton() : _renderGroup()}
			</Flex>
			{openModal && _renderModal()}
		</div>
	)
}

export default memo(EventParticipant)
