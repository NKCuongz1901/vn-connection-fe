'use client'
import { Flex } from 'antd'
import { memo, useCallback, useState } from 'react'

import EventTitle from '@/Components/Event/EventTitle'
import ItemEvent from '@/Components/Event/ItemEvent'
import ModalCRUDEvent from '@/Components/Event/ModalCRUDEvent'
import EventIcon from '@/svg/Event'

import { mappingEventTitle } from '@/Variable/event.variable'

import classes from './Event.module.scss'

const datas = [
	{
		start_time_date: '15/04/2025 19:51:33',
		id: '66823b00-19f8-11f0-b65b-cbd5683653c6',
		origin_id: '66823b00-19f8-11f0-b65b-cbd5683653c6',
		parent_id: null,
		user_id: 'e1104360-0721-11f0-b384-3d29fc89e215',
		conversation_id: null,
		category_id: null,
		title: 'gêgg',
		address:
			'Đ. Võ Thị Liễu/Hẻm 69 Phòng 6 - 16, Khu Phố 4, Quận 12, Hồ Chí Minh, Vietnam',
		address_en:
			'd. vo thi lieu/hem 69 phong 6 - 16, khu pho 4, quan 12, ho chi minh, vietnam',
		area_name: null,
		description: 'h',
		menu_price: '0:0',
		ticket_entrance: '9696000',
		ticket_entrance_type: 'ONLY',
		type: 'EVENT',
		limit_participant: 52,
		image: null,
		thumbnails: [
			'https://s3.ap-southeast-1.amazonaws.com/vnconnections/image-1744721510068-c8e8c3f0-3486-48c6-a809-99f0e7b76108.png',
		],
		start_time: '1744721493590',
		end_time: '1747597860000',
		repeat_type: {
			days: [],
			type: 'WEEKLY',
			current_repeat: 1,
			amount_of_repeat: 1,
		},
		history_repeat: [],
		position: {
			crs: {
				type: 'name',
				properties: {
					name: 'EPSG:4326',
				},
			},
			type: 'Point',
			coordinates: [106.6984861, 10.8582242],
		},
		longitude: 106.6984861,
		latitude: 10.8582242,
		amount_of_like: 0,
		amount_of_comment: 0,
		amount_of_participant: 1,
		amount_of_report: 0,
		share_link: 'https://univini.app.link/3j6uxMHsASb',
		is_change_address: false,
		created_at: '2025-04-15T12:51:51.104Z',
		updated_at: '2025-04-20T15:17:28.436Z',
		deleted_at: null,
		user: {
			name: '1123',
			phone: '+84828684370',
			avatar:
				'https://s3.ap-southeast-1.amazonaws.com/vnconnections/image-1743516300797-f581951a-4329-4234-b0b6-232c65c94af4.png',
			is_verified: false,
		},
		away: 0,
	},
	{
		start_time_date: '19/04/2025 12:12:12',
		id: 'de6550d0-1cdc-11f0-b63b-63878c81c2d4',
		origin_id: 'de6550d0-1cdc-11f0-b63b-63878c81c2d4',
		parent_id: null,
		user_id: 'e1104360-0721-11f0-b384-3d29fc89e215',
		conversation_id: null,
		category_id: null,
		title: 'ĩgigc',
		address:
			'VM5W+52H, Hẻm 43 Vườn Lài, An Phú Đông, Quận 12, Hồ Chí Minh, Vietnam',
		address_en:
			'vm5w+52h, hem 43 vuon lai, an phu dong, quan 12, ho chi minh, vietnam',
		area_name: null,
		description: 'gsgsvd',
		menu_price: '',
		ticket_entrance: '0',
		ticket_entrance_type: 'FREE',
		type: 'EVENT',
		limit_participant: 12,
		image: null,
		thumbnails: [
			'https://s3.ap-southeast-1.amazonaws.com/vnconnections/image-1745039538717-7024a3a6-186d-49c8-aa66-daf5aec80e9a.png',
		],
		start_time: '1745039532042',
		end_time: '1747285200000',
		repeat_type: {
			days: [],
			type: 'NONE',
			current_repeat: 1,
			amount_of_repeat: 1,
		},
		history_repeat: [],
		position: {
			crs: {
				type: 'name',
				properties: {
					name: 'EPSG:4326',
				},
			},
			type: 'Point',
			coordinates: [106.695, 10.858],
		},
		longitude: 106.695,
		latitude: 10.858,
		amount_of_like: 0,
		amount_of_comment: 1,
		amount_of_participant: 0,
		amount_of_report: 0,
		share_link: 'https://univini.app.link/UbtSVZtzGSb',
		is_change_address: false,
		created_at: '2025-04-19T05:12:19.825Z',
		updated_at: '2025-04-19T06:42:20.333Z',
		deleted_at: null,
		user: {
			name: '1123',
			phone: '+84828684370',
			avatar:
				'https://s3.ap-southeast-1.amazonaws.com/vnconnections/image-1743516300797-f581951a-4329-4234-b0b6-232c65c94af4.png',
			is_verified: false,
		},
		away: 0.38,
	},
	{
		start_time_date: '19/04/2025 20:51:00',
		id: 'febaa520-1d1c-11f0-bec7-af0bb8bd57d6',
		origin_id: 'febaa520-1d1c-11f0-bec7-af0bb8bd57d6',
		parent_id: null,
		user_id: 'e1104360-0721-11f0-b384-3d29fc89e215',
		conversation_id: null,
		category_id: null,
		title: 'bxbx',
		address:
			'Đ. Võ Thị Liễu/Hẻm 69 Phòng 6 - 16, Khu Phố 4, Quận 12, Hồ Chí Minh, Vietnam',
		address_en:
			'd. vo thi lieu/hem 69 phong 6 - 16, khu pho 4, quan 12, ho chi minh, vietnam',
		area_name: null,
		description: 'dhhd',
		menu_price: '1000:20000',
		ticket_entrance: '1000:2000',
		ticket_entrance_type: 'MULTIPLE_TICKET',
		type: 'EVENT',
		limit_participant: 12,
		image: null,
		thumbnails: [
			'https://s3.ap-southeast-1.amazonaws.com/vnconnections/image-1745067080688-4b185f92-883e-43e8-a834-ecf94461e1cb.png',
		],
		start_time: '1745070660000',
		end_time: '1749685860000',
		repeat_type: {
			days: [],
			type: 'WEEKLY',
			current_repeat: 1,
			amount_of_repeat: 1,
		},
		history_repeat: [],
		position: {
			crs: {
				type: 'name',
				properties: {
					name: 'EPSG:4326',
				},
			},
			type: 'Point',
			coordinates: [106.6984667, 10.8581756],
		},
		longitude: 106.6984667,
		latitude: 10.8581756,
		amount_of_like: 0,
		amount_of_comment: 0,
		amount_of_participant: 0,
		amount_of_report: 0,
		share_link: 'https://univini.app.link/9yzVYMh6GSb',
		is_change_address: false,
		created_at: '2025-04-19T12:51:21.873Z',
		updated_at: '2025-04-19T12:51:22.238Z',
		deleted_at: null,
		user: {
			name: '1123',
			phone: '+84828684370',
			avatar:
				'https://s3.ap-southeast-1.amazonaws.com/vnconnections/image-1743516300797-f581951a-4329-4234-b0b6-232c65c94af4.png',
			is_verified: false,
		},
		away: 0,
	},
	{
		start_time_date: '19/04/2025 21:24:51',
		id: '2d6808b0-1d2a-11f0-b519-b5dbba285246',
		origin_id: '2d6808b0-1d2a-11f0-b519-b5dbba285246',
		parent_id: null,
		user_id: 'e1104360-0721-11f0-b384-3d29fc89e215',
		conversation_id: null,
		category_id: null,
		title: 'tx',
		address:
			'Đ. Võ Thị Liễu/Hẻm 69 Phòng 6 - 16, Khu Phố 4, Quận 12, Hồ Chí Minh, Vietnam',
		address_en:
			'd. vo thi lieu/hem 69 phong 6 - 16, khu pho 4, quan 12, ho chi minh, vietnam',
		area_name: null,
		description: 'vz',
		menu_price: '',
		ticket_entrance: '0',
		ticket_entrance_type: 'FREE',
		type: 'EVENT',
		limit_participant: 1,
		image: null,
		thumbnails: [
			'https://s3.ap-southeast-1.amazonaws.com/vnconnections/image-1745072742537-7fe28757-e8e1-4600-8d6a-a8e611881d68.png',
		],
		start_time: '1745072691533',
		end_time: '1746368820000',
		repeat_type: {
			days: [],
			type: 'THREE_WEEK',
			current_repeat: 1,
			amount_of_repeat: 1,
		},
		history_repeat: [],
		position: {
			crs: {
				type: 'name',
				properties: {
					name: 'EPSG:4326',
				},
			},
			type: 'Point',
			coordinates: [106.6984588, 10.8581825],
		},
		longitude: 106.6984588,
		latitude: 10.8581825,
		amount_of_like: 0,
		amount_of_comment: 0,
		amount_of_participant: 0,
		amount_of_report: 0,
		share_link: 'https://univini.app.link/vTfZUR1cHSb',
		is_change_address: false,
		created_at: '2025-04-19T14:25:43.626Z',
		updated_at: '2025-04-19T14:25:43.968Z',
		deleted_at: null,
		user: {
			name: '1123',
			phone: '+84828684370',
			avatar:
				'https://s3.ap-southeast-1.amazonaws.com/vnconnections/image-1743516300797-f581951a-4329-4234-b0b6-232c65c94af4.png',
			is_verified: false,
		},
		away: 0,
	},
	{
		start_time_date: '19/04/2025 21:39:33',
		id: '1fedf3a0-1d2c-11f0-bec7-af0bb8bd57d6',
		origin_id: '1fedf3a0-1d2c-11f0-bec7-af0bb8bd57d6',
		parent_id: null,
		user_id: 'e1104360-0721-11f0-b384-3d29fc89e215',
		conversation_id: null,
		category_id: null,
		title: 'vsvs',
		address:
			'Đ. Võ Thị Liễu/10A Hẻm 69 Võ Thị Liễu, Khu Phố 4, Quận 12, Hồ Chí Minh, Vietnam',
		address_en:
			'd. vo thi lieu/10a hem 69 vo thi lieu, khu pho 4, quan 12, ho chi minh, vietnam',
		area_name: null,
		description: 'vsvd',
		menu_price: '',
		ticket_entrance: '0',
		ticket_entrance_type: 'FREE',
		type: 'EVENT',
		limit_participant: 15,
		image: null,
		thumbnails: [
			'https://s3.ap-southeast-1.amazonaws.com/vnconnections/image-1745073578404-75e15e54-760d-4f23-b491-dfba9cb193b4.png',
		],
		start_time: '1745073573072',
		end_time: '1747492740000',
		repeat_type: {
			days: [],
			type: 'BI_WEEK',
			current_repeat: 1,
			amount_of_repeat: 2,
		},
		history_repeat: [],
		position: {
			crs: {
				type: 'name',
				properties: {
					name: 'EPSG:4326',
				},
			},
			type: 'Point',
			coordinates: [106.698, 10.858],
		},
		longitude: 106.698,
		latitude: 10.858,
		amount_of_like: 0,
		amount_of_comment: 0,
		amount_of_participant: 0,
		amount_of_report: 0,
		share_link: 'https://univini.app.link/PhWheD1dHSb',
		is_change_address: false,
		created_at: '2025-04-19T14:39:40.010Z',
		updated_at: '2025-04-19T14:39:40.389Z',
		deleted_at: null,
		user: {
			name: '1123',
			phone: '+84828684370',
			avatar:
				'https://s3.ap-southeast-1.amazonaws.com/vnconnections/image-1743516300797-f581951a-4329-4234-b0b6-232c65c94af4.png',
			is_verified: false,
		},
		away: 0.06,
	},
]
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
		}
		switch (type) {
			case 'event':
				Content = <ModalCRUDEvent {...propsModal} />
				break
			default:
				break
		}
		return Content
	}, [openModal])
	return (
		<Flex className={classes.wrapper} vertical>
			<Flex className={classes.title}>
				<EventTitle
					label={mappingEventTitle[type] || type}
					number={datas.length}
					icon={<EventIcon />}
					onAddNew={(e) => {
						e?.stopPropagation?.()
						setOpenModal({ type: 'event', data: null })
					}}
				/>
			</Flex>
			<Flex className={classes.wrapperItem}>
				{datas.map((data) => (
					<ItemEvent key={data.id} data={data} type={type} />
				))}
			</Flex>
			{_renderModal()}
		</Flex>
	)
}

export default memo(Event)
