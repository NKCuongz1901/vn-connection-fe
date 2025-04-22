'use client'
import { Flex, Skeleton } from 'antd'
import { memo, useCallback, useState } from 'react'

import { arrayFrom } from '@/ultis/array.ults'

import EventTitle from '@/Components/Event/EventTitle'
import ItemEvent from '@/Components/Event/ItemEvent'
import ModalCRUDEvent from '@/Components/Event/ModalCRUDEvent'
import EventIcon from '@/svg/Event'

import { mappingEventTitle } from '@/Variable/event.variable'

import useEvent from '@/hooks/Event/useEvent'
import classes from './Event.module.scss'

interface EventProps {
	type: string
	[key: string]: any
}
interface openModalProps {
	type: string | null
	data: any
}

const Event = (_props: EventProps) => {
	const { type } = _props
	const {
		loading,
		total,
		listPost,
		_parentRef,
		_childRef,
		onScroll,
		onSuccess,
	} = useEvent({ type })
	const [openModal, setOpenModal] = useState<openModalProps>({
		type: null,
		data: null,
	})
	const _renderModal = useCallback(() => {
		const { type } = openModal
		let Content = <></>
		const propsModal = {
			open: true,
			onClose: () => setOpenModal({ type: null, data: null }),
			onSuccess: onSuccess,
		}
		switch (type) {
			case 'event':
				Content = <ModalCRUDEvent {...propsModal} />
				break
			default:
				break
		}
		return Content
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openModal])
	return (
		<Flex ref={_parentRef} className={classes.wrapper} vertical>
			<Flex className={classes.title}>
				<EventTitle
					label={mappingEventTitle[type] || type}
					number={total}
					icon={<EventIcon />}
					onAddNew={(e) => {
						e?.stopPropagation?.()
						setOpenModal({ type: 'event', data: null })
					}}
				/>
			</Flex>
			<Flex ref={_childRef} className={classes.wrapperItem} onScroll={onScroll}>
				{listPost.map((data) => (
					<ItemEvent key={data.id} data={data} type={type} />
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

export default memo(Event)
