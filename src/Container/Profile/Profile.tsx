'use client'
import { IconChevronLeft, IconDots } from '@tabler/icons-react'
import { Flex } from 'antd'
import dayjs from 'dayjs'
import { memo, useCallback } from 'react'

import useProfile from '@/hooks/Profile/useProfile'

import { getUserInfo, toJson } from '@/ultis/common.ults'

import CButton from '@/Components/Custom/CButton'

import { formatDate, mappingGender } from '@/Variable/common.variable'

import CAvatar from '@/Components/Custom/CAvatar'
import ModalEditProfile from '@/Components/Profile/ModalEditProfile'

import classes from './Profile.module.scss'
import { useSafeBack } from '@/ultis/route.ults'
import { mainRoutes } from '@/routes/MainRoutes'
interface ProfileProps {
	id?: string
}
const Profile = ({ id }: ProfileProps) => {
	const {
		userData,
		onOpenEditP,
		openEditProfile,
		onCloseEditP,
		onGetUserProfile,
	} = useProfile({
		id,
	})
	const { goBackOrPush } = useSafeBack()
	const _renderTotalInfo = useCallback(() => {
		const { avatar, cover, name, address, id } = userData || {}
		const isMe = id === getUserInfo('id')
		return (
			<Flex className={classes.totalInfo} vertical>
				<Flex className={classes.cover}>
					<img
						className={classes.coverImg}
						src={cover || '/images/defaultCover.png'}
						alt=""
					/>
					<Flex className={classes.header}>
						<Flex className={classes.icon}>
							<IconChevronLeft onClick={() => goBackOrPush(mainRoutes.home)} />
						</Flex>
						<Flex className={classes.icon}>
							<IconDots />
						</Flex>
					</Flex>
				</Flex>
				<Flex className={classes.infoWrapper}>
					<Flex className={classes.info}>
						<Flex className={classes.avatarWrapper}>
							<CAvatar className={classes.avatar} size={96} src={avatar} />
						</Flex>
						<Flex className={classes.commonInfo} vertical>
							<div className={classes.name}>{name}</div>
							<div className={classes.address}>{address || ''}</div>
							<Flex className={classes.status}>Available</Flex>
						</Flex>
					</Flex>
					<Flex className={classes.endButton}>
						{isMe ? (
							<>
								<CButton ctype="oranger" style={{ height: 40 }}>
									Invite friend
								</CButton>
								<CButton
									ctype="disabled"
									style={{ height: 40 }}
									onClick={onOpenEditP}
								>
									Edit Profile
								</CButton>
							</>
						) : (
							<>
								<CButton ctype="oranger" style={{ height: 40 }}>
									Add friend
								</CButton>
								<CButton ctype="disabled" style={{ height: 40 }}>
									Inbox
								</CButton>
							</>
						)}
					</Flex>
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderMessageForU = useCallback(() => {
		const { who_i_am, looking_for, i_can_offer } = userData || {}
		const content = [
			{
				label: 'I am',
				value: who_i_am,
				id: 1,
			},
			{
				label: 'I’m looking for',
				value: looking_for,
				id: 2,
			},
			{
				label: 'I can offer',
				value: i_can_offer,
				id: 3,
			},
		]
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>Message for you</div>
					{content.map((item) => (
						<Flex key={item.id} vertical>
							<div className={classes.label}>{item.label}</div>
							<div>{item.value}</div>
						</Flex>
					))}
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderAbout = useCallback(() => {
		const { about_me } = userData || {}
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>About me</div>
					<div>{about_me}</div>
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderSumary = useCallback(() => {
		const { amount_of_friend, gender, age, birthday } = userData || {}
		console.log(
			'🌸🌸🌸 TrieuNinhHan ~ const_renderSumary=useCallback ~ amount_of_friend:',
			amount_of_friend,
		)

		const content = [
			{
				label: 'Friends',
				value: (amount_of_friend || 0) + ' friends',
				id: 1,
			},
			{
				label: 'Gender',
				value: mappingGender[gender],
				id: 2,
			},
			{
				label: 'Age',
				value: age,
				id: 3,
			},
			{
				label: 'Member since',
				value: birthday ? dayjs(birthday).format(formatDate.dmy) : '',
				id: 4,
			},
		]
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>Summary</div>
					{content.map((item) => (
						<Flex key={item.id} vertical>
							<div className={classes.label}>{item.label}</div>
							<div className={item.id === 1 ? classes.friend : ''}>
								{item.value}
							</div>
						</Flex>
					))}
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderSpecial = useCallback(() => {
		const { i_am_interested_in, languages_can_speak, country_visited } =
			userData || {}
		const content = [
			{
				label: 'Intersted in',
				value: i_am_interested_in,
				id: 1,
			},
			{
				label: 'Languages I can speak',
				value: languages_can_speak,
				id: 2,
			},
			{
				label: "Countries I've visited",
				value: country_visited,
				id: 3,
			},
		]
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>Specialties</div>
					{content.map((item) => (
						<Flex key={item.id} vertical>
							<div className={classes.label}>{item.label}</div>
							<div>{item.value}</div>
						</Flex>
					))}
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])
	return (
		<Flex className={classes.wrapper} vertical>
			{_renderTotalInfo()}
			{_renderMessageForU()}
			{_renderAbout()}
			{_renderSumary()}
			{_renderSpecial()}
			{openEditProfile && (
				<ModalEditProfile
					open={openEditProfile}
					onClose={onCloseEditP}
					data={userData}
					onGetUserProfile={onGetUserProfile}
				/>
			)}
		</Flex>
	)
}

export default memo(Profile)
