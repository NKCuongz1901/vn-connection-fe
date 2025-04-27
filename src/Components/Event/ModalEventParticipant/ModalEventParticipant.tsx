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

interface ModalEventParticipantProps {
	id: string
	onClose?: any
}

const ModalEventParticipant = (_props: ModalEventParticipantProps) => {
	const { id, onClose } = _props
	const { onGetPath } = useLocalePath()
	const { loading, _parentRef, _childRef, participantList, onScroll } =
		useModalEventParticipant({ id })
	return (
		<CModal
			onClose={onClose}
			onCancel={onClose}
			title={'Participants'}
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
