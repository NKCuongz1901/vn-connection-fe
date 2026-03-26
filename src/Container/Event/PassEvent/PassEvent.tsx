'use client'
import { Flex, Skeleton } from 'antd'
import { memo } from 'react'

import usePassEvent from '@/hooks/Event/usePassEvent'

import { arrayFrom } from '@/ultis/array'
import { useSafeBack } from '@/ultis/route'

import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'
import EventTitle from '@/Components/Event/EventTitle'
import ItemEvent from '@/Components/Event/ItemEvent'
import ArrrowLeftIcon from '@/svg/ArrrowLeftIcon'
import FeedbackIcon from '@/svg/FeedbackIcon'

import { mainRoutes } from '@/routes/MainRoutes'

import classes from './PassEvent.module.scss'

const PassEvent = () => {
	const { goBackOrPush } = useSafeBack()
	const {
		loading,

		_parentRef,
		_childRef,
		total,
		listPost,
		modal,

		onScroll,
		onCloseModal,
	} = usePassEvent()

	const _renderModal = () => {
		const { type } = modal || {}

		switch (type) {
			case 'confirm':
				return (
					<CModal
						onClose={onCloseModal}
						onCancel={onCloseModal}
						styles={{
							content: {
								width: 378,
							},
						}}
						footer={[
							<Flex key="back" justify="flex-end">
								<CButton
									onClick={onCloseModal}
									ctype="oranger"
									style={{ width: '100%' }}
								>
									I got it
								</CButton>
							</Flex>,
						]}
					>
						<div className={classes.wrapperModal}>
							<Flex className={classes.modalIcon}>
								<FeedbackIcon />
							</Flex>
							<Flex className={classes.title}>Past activities</Flex>
							<Flex className={classes.containerModal} vertical>
								Past activities are kept here for 3 months after the end
							</Flex>
						</div>
					</CModal>
				)
			default:
				return null
		}
	}

	return (
		<Flex ref={_parentRef} className={classes.wrapper} vertical>
			<div className={classes.eventTitle} onClick={() => goBackOrPush()}>
				<EventTitle
					hiddenAdd
					label={'Past activities'}
					number={total}
					labelCreateBtn="Create activity"
					icon={<ArrrowLeftIcon />}
					endIcon={<div></div>}
				/>
			</div>
			<Flex ref={_childRef} className={classes.wrapperItem} onScroll={onScroll}>
				{listPost.map((data) => (
					<ItemEvent key={data.id} data={data} type={mainRoutes.event} />
				))}
				{loading &&
					arrayFrom(3).map((_, index) => (
						<Skeleton.Input
							key={index}
							active
							className={classes.contentBody}
						/>
					))}
			</Flex>
			{_renderModal()}
		</Flex>
	)
}

export default memo(PassEvent)
