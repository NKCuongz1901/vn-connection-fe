'use client'
import React, { memo } from 'react'
import { Flex } from 'antd'

import classes from './Search.module.scss'
import CInputMap from '@/Components/Custom/CInputMap'
import useSearch from '@/hooks/Search/useSearch'
import { IconMapPinFilled } from '@tabler/icons-react'
import EventTitle from '@/Components/Event/EventTitle'
import ProfileIcon from '@/svg/ProfileIcon'
import CAvatar from '@/Components/Custom/CAvatar'
import { onPushState, useLocalePath } from '@/ultis/route.ults'
import Local from '@/Components/Search/Local'
import { mainRoutes } from '@/routes/MainRoutes'
import Event from '../Event'
import clsx from 'clsx'
import CImage from '@/Components/Custom/CImage'
import SocialEvent from '@/Components/Search/SocialEvent'
const Search = () => {
	const { onChangeRoute } = useLocalePath()
	const {
		loading,
		user,
		event,
		data,
		total,
		location,
		type,
		setType,
		onChangeValue,
	} = useSearch({})
	console.log('🏖️🏖️🏖️ TrieuNinhHan ~ :30 ~ Search ~ event:', event)

	const { address, longitude, latitude } = location
	const _renderInputMap = () => {
		if (type) return
		return (
			<CInputMap
				title="Location"
				value={address}
				longitude={longitude}
				latitude={latitude}
				placeholder="Location by city, district"
				onSubmitModal={onChangeValue('location')}
				prefix={<IconMapPinFilled fill="#E55A0F" />}
			/>
		)
	}
	const _renderUser = () => {
		if (type) return
		return (
			<Flex className={classes.userContainer} vertical>
				<div
					className={classes.titleUser}
					onClick={() => onPushState({ t: 'user', longitude, latitude })}
				>
					<EventTitle
						hiddenNumber
						hiddenAdd
						label={`${total.user} locals and expats ${
							address ? `in ${address}` : ''
						}`}
						icon={<ProfileIcon />}
					/>
				</div>
				<Flex className={classes.userList}>
					{(user || []).map((item) => (
						<Flex
							key={item.id}
							vertical
							className={classes.user}
							onClick={() => onChangeRoute(`${mainRoutes.profile}/${item.id}`)}
						>
							<CAvatar src={item.avatar} className={classes.userAvatar} />
							<div className={classes.userName}> {item.name}</div>
						</Flex>
					))}
				</Flex>
			</Flex>
		)
	}
	const _renderEvent = () => {
		if (type) return
		return (
			<Flex className={classes.eventContainer} vertical>
				<div
					className={classes.titleEvent}
					onClick={() => onPushState({ t: 'event', longitude, latitude })}
				>
					<EventTitle
						hiddenNumber
						hiddenAdd
						label={`${total.event} social events ${
							address ? `in ${address}` : ''
						}`}
						icon={<ProfileIcon />}
					/>
				</div>
				<Flex className={classes.eventList}>
					{(event || []).map((item) => (
						<Flex
							key={item.id}
							vertical
							className={classes.event}
							onClick={() =>
								onChangeRoute(`${mainRoutes.upcomingEvent}/${item.id}`)
							}
						>
							<CImage src={item?.thumbnails?.[0]} />
							<div className={classes.eventLabel}>{item.title}</div>
						</Flex>
					))}
				</Flex>
			</Flex>
		)
	}
	const _renderBodyType = () => {
		console.log('🏖️🏖️🏖️ TrieuNinhHan ~ :64 ~ _renderBodyType ~ type:', type)
		switch (type) {
			case 'user':
				return <Local data={data} />
			case 'event':
				return <SocialEvent data={data} />
			default:
				return
		}
	}
	return (
		<div className={clsx(classes.wrapper)}>
			<Flex className={clsx(classes.container)} vertical>
				{_renderInputMap()}
				{_renderUser()}
				{_renderEvent()}
				{_renderBodyType()}
			</Flex>
		</div>
	)
}

export default memo(Search)
