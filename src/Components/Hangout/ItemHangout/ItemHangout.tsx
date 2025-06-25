import {
	IconGenderBigender,
	IconGenderFemale,
	IconGenderMale,
} from '@tabler/icons-react'
import { Flex } from 'antd'
import { memo, useCallback, useState } from 'react'

import { sendHangout } from '@/apis/hangoutApi'
import { joinPost } from '@/apis/postApis'

import { isArray } from '@/ultis/array.ults'
import { getDiffFromNow } from '@/ultis/date.ults'

import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import { useModal } from '@/context/ModalContext'
import ClockIcon from '@/svg/ClockIcon'
import MapIcon from '@/svg/MapIcon'

import classes from './ItemHangout.module.scss'

interface ItemHangoutProps {
	item: any
	isHiddenButton?: boolean
	onClick?: any
	setOpenHangoutList?: React.Dispatch<React.SetStateAction<any>>

	setOpenHangoutSearch?: React.Dispatch<React.SetStateAction<any>>
}
const ItemHangout = ({
	item,
	isHiddenButton = false,
	onClick,
	setOpenHangoutList = undefined,
	setOpenHangoutSearch = undefined,
}: ItemHangoutProps) => {
	const [loading, setLoading] = useState(false)
	const { openError, openSuccess } = useModal()

	const {
		id,
		participants,
		avatar,
		away,
		start_time,
		title,
		user,
		title_open_hangout,
		origin_id,
	} = item || {}
	const images = (participants || []).slice(0, 3)
	const { name, languages_can_speak, gender, age } = (user ? user : item) || {}
	const { value: time, unit } = start_time
		? getDiffFromNow({
				input: Number(start_time),
		  })
		: { value: 30, unit: 'minute' }

	const handleSendHangout = useCallback(
		async ({ idol_id, post_id }: { idol_id?: string; post_id?: string }) => {
			setLoading(true)
			try {
				const res: any = await (post_id
					? joinPost({ post_id })
					: sendHangout({ idol_id: idol_id }))
				if (res?.code === 200) {
					if (setOpenHangoutList) {
						setOpenHangoutList((prev) => prev.filter((item) => item.id !== id))
					}
					if (setOpenHangoutSearch) {
						setOpenHangoutSearch((prev) =>
							prev.filter((item) => item.id !== id),
						)
					}
					openSuccess({
						message:
							'Hangout request sent successfully, please wait for response!',
					})
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoading(false)
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)
	const GENDER = {
		FEMALE: <IconGenderFemale style={{ color: '#ED5DCD', height: 16 }} />,
		MALE: <IconGenderMale style={{ color: '#2381FF', height: 16 }} />,
		OTHER: <IconGenderBigender style={{ color: '#006B35', height: 16 }} />,
	}
	const _renderMoreImages = () => {
		if (!isArray(participants, 4)) return null
		return (
			<Flex className={classes.moreImages} vertical>
				<span>{participants.length - 3} + </span>

				<span>People</span>
			</Flex>
		)
	}
	return (
		<Flex key={id} className={classes.itemHangout} vertical onClick={onClick}>
			<Flex className={classes.avatars}>
				{isArray(images, 1) ? (
					images.map((part, index) => {
						const { avatar, id } = part?.user || {}
						return (
							<Flex className={classes.avatar} key={id}>
								<CImage src={avatar} />
								{index === 2 && _renderMoreImages()}
							</Flex>
						)
					})
				) : (
					<CImage src={avatar} />
				)}
			</Flex>
			<Flex className={classes.timeSpace}>
				<Flex className={classes.timeSpaceItem}>
					<MapIcon />
					{away} km away
				</Flex>
				<Flex className={classes.timeSpaceItem}>
					<ClockIcon />
					{time} {unit ? unit + 's ago' : ''}
				</Flex>
			</Flex>
			<Flex className={classes.info} vertical>
				<span className={classes.title}>{title || title_open_hangout}</span>
				<Flex className={classes.otherInfo}>
					<Flex className={classes.infoItem} vertical>
						<div>
							{name}, {age} {GENDER[gender]}
						</div>
						<div>{languages_can_speak}</div>
					</Flex>
					{!isHiddenButton && (
						<CButton
							ctype="oranger"
							onClick={() =>
								handleSendHangout(
									origin_id ? { post_id: origin_id } : { idol_id: id },
								)
							}
							disabled={loading}
						>
							Say Hello
						</CButton>
					)}
				</Flex>
			</Flex>
		</Flex>
	)
}

export default memo(ItemHangout)
