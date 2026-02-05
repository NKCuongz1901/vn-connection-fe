'use client'
import { Flex, Skeleton } from 'antd'
import { memo, useCallback, useState } from 'react'

import { arrayFrom } from '@/ultis/array.ults'
import { useLocalePath } from '@/ultis/route.ults'

import EventTitle from '@/Components/Event/EventTitle'
import ItemEvent from '@/Components/Event/ItemEvent'
import ModalCRUDEvent from '@/Components/Event/ModalCRUDEvent'
import EventIcon from '@/svg/Event'

import { mappingEventTitle } from '@/Variable/event.variable'

import useEvent from '@/hooks/Event/useEvent'
import classes from './Event.module.scss'
import clsx from 'clsx'

const mappingTabBtn = {
	interested: 'interested',
	my: 'my',
}
const tabBtns = [
	{ value: mappingTabBtn.interested, label: 'Interested activities' },
	{ value: mappingTabBtn.my, label: 'My activities' },
]
interface EventProps {
	type: string
	onCRUDSuccess?: any
	hiddenAdd?: boolean
	[key: string]: any
}
interface openModalProps {
	type: string | null
	data: any
}

const Event = (_props: EventProps) => {
	const { type, onCRUDSuccess, hiddenAdd = false } = _props
	const { onChangeRoute } = useLocalePath()
	const {
		loading,
		total,
		tabActive,

		listPost,
		_parentRef,
		_childRef,
		onScroll,
		onSuccess,
		setTabActive,
	} = useEvent({ type, tabBtns, mappingTabBtn, onCRUDSuccess })
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
			{false && (
				<Flex className={classes.title} onClick={() => onChangeRoute(type)}>
					<EventTitle
						hiddenAdd={hiddenAdd}
						label={mappingEventTitle[type] || type}
						number={total[mappingTabBtn.my]}
						labelCreateBtn="Create activity"
						icon={<EventIcon />}
						onAddNew={(e) => {
							e?.stopPropagation?.()
							setOpenModal({ type: 'event', data: null })
						}}
					/>
				</Flex>
			)}
			<Flex className={classes.tabBtnWrapper}>
				{tabBtns.map((i) => (
					<div
						key={i.value}
						className={clsx(classes.tabBtn, {
							[classes.tabBtnActive]: i.value === tabActive,
						})}
						onClick={() => setTabActive(i.value)}
					>
						{i.label} ({total[i.value] || 0})
					</div>
				))}
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
