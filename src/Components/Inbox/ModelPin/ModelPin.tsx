'use client'
import { Dropdown, Flex } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'

import { getPinMessageById, pinMessageById } from '@/apis/conversationApis'

import { cloneDeep, toJson } from '@/ultis/common'
import { getUserInfo } from '@/ultis/storage'

import CAvatar from '@/Components/Custom/CAvatar'
import CImage from '@/Components/Custom/CImage'
import CModal from '@/Components/Custom/CModal/CModal'
import { useModal } from '@/context/ModalContext'
import PinIcon from '@/svg/PinIcon'

import {
	paginationCommon,
	specialTypeMessage,
} from '@/Variable/common.variable'
import { PaginationType } from '@/interface/common/common.interface'

import classes from './ModelPin.module.scss'

interface ModelPinProps {
	data?: any
	onClose: () => void
}

const ModelPin = ({ data, onClose }: ModelPinProps) => {
	const { openError } = useModal()
	const _loadmore = useRef<boolean>(true)
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))

	const [pinList, setPinList] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const handleGetPinMessage = async () => {
		const { page, limit } = _paginationRefs.current
		setLoading(true)
		let isNew = false
		if (page === 1) {
			isNew = true
		}
		try {
			const res: any = await getPinMessageById({
				id: data.id,
				params: {
					page,
					limit,
				},
			})
			if (res) {
				if (res?.results?.objects?.rows.length < limit) {
					_loadmore.current = false
				}
				const _data = res?.results?.objects?.rows
				setPinList((prev) => {
					const returnData = [...prev, ..._data]
					return isNew ? _data : returnData
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}
	const handleUnpinMessage = async (id) => {
		try {
			setPinList((prev) =>
				prev.map((i) => (i.id === id ? { ...i, isTemp: true } : i)),
			)

			const res: any = await pinMessageById({
				id: id,
				payload: {
					type_pin: 'unpin',
				},
			})
			if (res) {
				setPinList((prev) => prev.filter((i) => i.id !== id))
			}
		} catch (error) {
			setPinList((prev) =>
				prev.map((i) => (i.id === id ? { ...i, isTemp: false } : i)),
			)
			openError(error)
		}
	}
	const handleGetMenus = ({ isMe, item }: { [key: string]: any }) => {
		const menus: ItemType[] = [
			{
				key: 'unpin',
				label: 'Unpin',
				onClick: () => handleUnpinMessage(item?.id),
			},
			...(isMe ? [] : []),
		]
		return menus
	}
	const handleLoadMore = async () => {
		if (!_loadmore.current || loading) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((pinList || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetPinMessage()
	}
	const handleScroll = (e: any) => {
		const clientHeight = e.target.clientHeight
		const scrollHeight = e.target.scrollHeight
		const scrollTop = Math.abs(e.target.scrollTop)
		const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
		if (!isReachedEnd) return

		handleLoadMore()
	}
	useEffect(() => {
		handleGetPinMessage()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(data)])

	const _renderContentChat = ({ type, content, medias, created_at }) => {
		switch (type) {
			case 'TEXT':
				return (
					<div className={classes.text}>
						<div>{content}</div>
						<div className={classes.timeText}>
							{created_at ? dayjs(created_at).format('DD/MM/YYYY HH:mm') : ''}
						</div>
					</div>
				)
			case 'STICKER':
				return (
					<Flex vertical>
						<CImage src={content} />
						<div className={classes.time}>
							{created_at ? dayjs(created_at).format('DD/MM/YYYY HH:mm') : ''}
						</div>
					</Flex>
				)
			case 'MEDIAS':
				return (
					<Flex className={classes.medias} vertical>
						{(medias || []).map((media, index) => (
							<Flex className={classes.media} key={index}>
								<CImage src={media.url} />
							</Flex>
						))}
						<div className={classes.time}>
							{created_at ? dayjs(created_at).format('DD/MM/YYYY HH:mm') : ''}
						</div>
					</Flex>
				)

			default:
				return <Flex className={classes.memberAccept}>{type}</Flex>
		}
	}

	const _renderItemChat = ({ item }) => {
		const {
			id,
			sender: user,
			isFirst,
			isLast,
			type,
			user_id,
			isTemp,
		} = item || {}

		const isMe = getUserInfo('id') === user_id
		const isMemberAction = specialTypeMessage.includes(type)
		return (
			<Flex
				className={clsx(classes.itemChat, {
					[classes.mt2]: isFirst,
					[classes.isMe]: isMe,
					[classes.isLast]: isLast,
					[classes.isCenter]: isMemberAction,
					[classes.isTemp]: isTemp,
				})}
				key={id}
			>
				<Flex className={classes.contentItem}>
					<Flex className={classes.avatar}>
						{<CAvatar src={user?.avatar} />}
					</Flex>
					<Flex className={classes.contentInfo} vertical>
						<Flex className={classes.name}>
							<Flex className={classes.pinIcon}>
								<PinIcon />
							</Flex>
							{user?.name}
						</Flex>
						<Flex className={classes.content}>
							<Dropdown
								trigger={['click']}
								menu={{ items: handleGetMenus({ item, isMe }) }}
								disabled={isTemp}
							>
								{_renderContentChat(item)}
							</Dropdown>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		)
	}

	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={'Pinned messages'}
				styles={{
					content: {
						width: 800,
					},
				}}
				footer={[<div key="back"></div>]}
			>
				<div className={classes.container}>
					<Flex
						className={classes.wrapperModal}
						onScroll={handleScroll}
						vertical
					>
						{pinList.map((item) => _renderItemChat({ item }))}
					</Flex>
				</div>
			</CModal>
		</div>
	)
}

export default ModelPin
