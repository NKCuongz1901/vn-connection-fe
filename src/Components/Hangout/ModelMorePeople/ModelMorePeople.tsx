'use client'
import { IconCheck, IconX } from '@tabler/icons-react'
import { Flex } from 'antd'

import useModelMorePeople from '@/hooks/Hangout/useModelMorePeople'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'

import classes from './ModelMorePeople.module.scss'

interface ModelChooseHangoutProps {
	postId?: any
	onClose: () => void
}

const ModelChooseHangout = ({ postId, onClose }: ModelChooseHangoutProps) => {
	const { myWaitting, onActionPart, onActionMuti } = useModelMorePeople({
		id: postId,
		onClose,
	})
	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={'Request hangout list'}
				styles={{
					content: {
						width: 800,
					},
				}}
				footer={[
					<Flex key="back" justify="flex-end" gap="12px">
						<CButton
							onClick={() => onActionMuti({ type: 'REJECT' })}
							ctype="error"
							style={{ width: 200 }}
						>
							Reject all
						</CButton>
						<CButton
							onClick={() => onActionMuti({ type: 'ACCEPT' })}
							ctype="success"
							style={{ width: 200 }}
						>
							Accept all
						</CButton>
					</Flex>,
				]}
			>
				<div className={classes.container}>
					{(myWaitting || []).map((item) => (
						<Flex key={item.id} className={classes.waitingItem}>
							<Flex className={classes.waitingItemLeft}>
								<CAvatar src={item?.user?.avatar} />
								<Flex vertical className={classes.nameWrapper}>
									<span className={classes.name}>{item?.user?.name}</span>
									<span className={classes.desc}>
										Request to join this hangout
									</span>
								</Flex>
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
					))}
				</div>
			</CModal>
		</div>
	)
}

export default ModelChooseHangout
