'use client'

import clsx from 'clsx'
import { memo } from 'react'

import { TalkRoomListenerInRoom } from '@/apis/talkRoomApis'
import CAvatar from '@/Components/Custom/CAvatar'
import DotIcon from '@/svg/DotIcon'
import FeMaleIcon from '@/svg/FeMaleIcon'
import GenderIcon from '@/svg/GenderIcon'
import MaleIcon from '@/svg/MaleIcon'
import { mappingFlag } from '@/Variable/countryVariable'

import classes from './DetailTalkroomListenerPanel.module.scss'

const genderIcon = {
	MALE: MaleIcon,
	FEMALE: FeMaleIcon,
	OTHER: GenderIcon,
}

const genderFill = {
	MALE: '#2381FF',
	FEMALE: '#E55A8F',
	OTHER: '#7987A4',
}

type DetailTalkroomListenerItemProps = {
	listener: TalkRoomListenerInRoom
	onClick?: () => void
}

/** Single listener card: avatar, country flag, name, age and gender. */
function DetailTalkroomListenerItem({
	listener,
	onClick,
}: DetailTalkroomListenerItemProps) {
	const user = listener.user
	const countryCode = user?.country_code || user?.i_am_from || ''
	const IconGender =
		genderIcon[user?.gender as keyof typeof genderIcon] ?? genderIcon.OTHER
	const genderColor =
		genderFill[user?.gender as keyof typeof genderFill] ?? genderFill.OTHER

	return (
		<div
			className={clsx(classes.listenerItem, {
				[classes.listenerItemClickable]: Boolean(onClick),
			})}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			onKeyDown={
				onClick
					? (event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault()
								onClick()
							}
						}
					: undefined
			}
		>
			<div className={classes.listenerAvatarWrap}>
				<CAvatar
					src={user?.avatar}
					size={64}
					className={classes.listenerAvatar}
				/>
				{!!countryCode && (
					<div className={classes.listenerFlagWrapper}>
						<div
							className={clsx(
								classes.listenerFlag,
								`flag:${mappingFlag[countryCode] || countryCode}`,
							)}
						/>
					</div>
				)}
			</div>
			<div className={classes.listenerInfo}>
				<p className={classes.listenerName}>{user?.name || '—'}</p>
				{(user?.age != null || user?.gender) && (
					<div className={classes.listenerMeta}>
						{user?.age != null && (
							<>
								<span className={classes.listenerAge}>{user.age}yrs</span>
								{user?.gender && <DotIcon />}
							</>
						)}
						{user?.gender && (
							<span className={classes.listenerGenderIcon}>
								<IconGender fill={genderColor} width={12} height={12} />
							</span>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

export default memo(DetailTalkroomListenerItem)
