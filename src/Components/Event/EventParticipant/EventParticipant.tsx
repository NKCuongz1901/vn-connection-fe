import { Flex, Skeleton } from 'antd'
import Link from 'next/link'
import { memo } from 'react'

import useEventParticipant from '@/hooks/Event/useEventParticipant'

import { arrayFrom } from '@/ultis/array.ults'
import { useLocalePath } from '@/ultis/route.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import GroupPeopleIcon from '@/svg/Event/GroupPeopleIcon'
import ModalEventParticipant from '../ModalEventParticipant'

import { mainRoutes } from '@/routes/MainRoutes'
import { participantType } from '@/Variable/event.variable'

import classes from './EventParticipant.module.scss'

interface EventParticipant {
	id?: any
}
const limit = 5
const EventParticipant = ({ id }: EventParticipant) => {
	const { onGetPath } = useLocalePath()
	const { loading, total, participantList, openModal, setOpenModal } =
		useEventParticipant({
			id,
		})
	const _renderSkeleton = () => {
		return arrayFrom(3).map((_, id) => <Skeleton.Avatar key={id} />)
	}
	const _renderGroup = () => {
		return (
			<>
				{participantList?.slice(0, limit)?.map((item) => {
					const { type, user, id, user_id } = item || {}
					const { avatar } = user || {}
					const isOnwer = type === participantType.OWNER
					const Content = isOnwer ? CAvatarBandage : CAvatar

					return (
						<Link
							key={id}
							href={onGetPath(`${mainRoutes.profile}/${user_id}`)}
							target="_blank"
						>
							<Content src={avatar} />
						</Link>
					)
				})}

				{total > limit && (
					<Flex className={classes.moreMember}>
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
