'use client'
import { Flex } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import useSearch from '@/hooks/Search/useSearch'

import { onPushState, useLocalePath } from '@/ultis/route'

import CAvatar from '@/Components/Custom/CAvatar'
import CImage from '@/Components/Custom/CImage'
import EventTitle from '@/Components/Event/EventTitle'
import Local from '@/Components/Search/Local'
import SocialEvent from '@/Components/Search/SocialEvent'

import ProfileIcon from '@/svg/ProfileIcon'

import { mainRoutes } from '@/routes/MainRoutes'

import classes from './Search.module.scss'
import MiniAppList from '@/Components/MiniApp/MiniAppList'
import { formatLastOnlineShort, getDiffFromNow } from '@/ultis/date'

const Search = () => {
	const { onChangeRoute } = useLocalePath()
	const { user, event, club, data, total, location, type } = useSearch({})

	const { address, longitude, latitude, type: typeLocation } = location
	const _renderUser = () => {
		if (type) return
		return (
			<Flex className={classes.userContainer} vertical>
				<div
					className={classes.titleUser}
					onClick={() =>
						onPushState({
							t: 'user',
							longitude,
							latitude,
							address,
							type: typeLocation,
						})
					}
				>
					<EventTitle
						hiddenNumber
						hiddenAdd
						label={`${total.user} Locals and Expats ${
							address ? `in ${address}` : ''
						}`}
						icon={<ProfileIcon />}
					/>
				</div>
				<Flex className={classes.userList}>
					{(user || []).map((item) => {
						const { id, avatar, name, visibility, online_time } = item
						const isOnline = visibility === 'ONLINE'

						return (
							<Flex
								key={id}
								vertical
								className={classes.user}
								onClick={() => onChangeRoute(`${mainRoutes.profile}/${id}`)}
							>
								<div className={classes.userAvatarWrapper}>
									<div className={classes.avatarWrap}>
										<CAvatar src={avatar} className={classes.userAvatar} />
										{!isOnline && online_time && (
											<span className={classes.lastSeen}>
												{formatLastOnlineShort(online_time)}
											</span>
										)}
									</div>
								</div>
								<Flex
									align="center"
									justify="center"
									gap={4}
									className={classes.userNameRow}
								>
									{isOnline && (
										<span className={classes.onlineDot} aria-label="Online" />
									)}
									<div className={classes.userName}>{name}</div>
								</Flex>
							</Flex>
						)
					})}
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
					onClick={() =>
						onPushState({
							t: 'event',
							longitude,
							latitude,
							address,
							type: typeLocation,
						})
					}
				>
					<EventTitle
						hiddenNumber
						hiddenAdd
						label={`${total.event} Social Activities ${
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
	const _renderClub = () => {
		if (type) return
		return (
			<Flex className={classes.eventContainer} vertical>
				<div
					className={classes.titleEvent}
					onClick={() =>
						onChangeRoute(
							`${mainRoutes.exploreInterest}?lat=${latitude}&lng=${longitude}&address=${address}&type=${(typeLocation || []).join(',')}`,
						)
					}
				>
					<EventTitle
						hiddenNumber
						hiddenAdd
						label={`${total.club} Communities ${address ? `in ${address}` : ''}`}
						icon={<ProfileIcon />}
					/>
				</div>
				<Flex className={classes.eventList}>
					{(club || []).map((item) => (
						<Flex
							key={item.id}
							vertical
							className={classes.event}
							onClick={() =>
								onChangeRoute(`${mainRoutes.community}/${item.id}`)
							}
						>
							<CImage src={item.avatar} />
							<div className={classes.eventLabel}>{item.title}</div>
						</Flex>
					))}
				</Flex>
			</Flex>
		)
	}
	const _renderBodyType = () => {
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
				<MiniAppList />
				{_renderUser()}
				{_renderEvent()}
				{_renderClub()}
				{_renderBodyType()}
			</Flex>
		</div>
	)
}

export default memo(Search)
