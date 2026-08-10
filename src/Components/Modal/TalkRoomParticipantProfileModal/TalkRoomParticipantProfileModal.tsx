'use client'

import {
	IconFlag,
	IconHeadphones,
	IconMinus,
	IconShare,
	IconTrash,
	IconUserPlus,
	IconX,
} from '@tabler/icons-react'
import clsx from 'clsx'
import { Fragment, memo, useMemo } from 'react'

import { TalkRoomUserProfileStats } from '@/apis/talkRoomApis'
import CAvatar from '@/Components/Custom/CAvatar'
import CModal from '@/Components/Custom/CModal/CModal'
import ModalReport from '@/Components/Custom/ModalReport'
import TalkRoomStats from '@/Components/TalkRoom/TalkRoomStats/TalkRoomStats'
import { UserProps } from '@/interface/User/User.interface'

import FeMaleIcon from '@/svg/FeMaleIcon'
import GenderIcon from '@/svg/GenderIcon'
import MaleIcon from '@/svg/MaleIcon'
import UserTagIcon from '@/svg/Talkroom/UserTagIcon'
import TrashIcon from '@/svg/TrashIcon'
import HeadPhoneIcon from '@/svg/Talkroom/HeadPhoneIcon'
import FriendNormalIcon from '@/svg/FriendNormalIcon'

import { isArray } from '@/ultis/array'
import { getAge } from '@/ultis/date'
import {
	mappingLevelOptions,
	REPORT_ISSUE_TYPE,
} from '@/Variable/common.variable'
import {
	mappingCountriesOptions,
	mappingFlag,
} from '@/Variable/countryVariable'

import classes from './TalkRoomParticipantProfileModal.module.scss'

const DEFAULT_TOTAL_HOST_TIME_MINUTES = 20
import FlagIcon from '@/svg/Talkroom/FlagIcon'

export type TalkRoomParticipantProfileRole =
	| 'host-self'
	| 'speaker'
	| 'listener'
	| 'listener-self'
	| 'listener-other'
	| 'speaker-self'
	| 'speaker-other'

export type TalkRoomParticipantProfileAction =
	| 'stop_hosting'
	| 'invite_to_speaker'
	| 'remove_from_room'
	| 'stepdown_to_listener'
	| 'assign_as_host'
	| 'add_friend'
	| 'report'
	| 'block'

type TalkRoomParticipantProfileModalProps = {
	open: boolean
	role: TalkRoomParticipantProfileRole
	userProfile?: UserProps | null
	talkRoomStats?: TalkRoomUserProfileStats | null
	loadingProfile?: boolean
	actionLoading?: boolean
	reportOpen?: boolean
	showStopHosting?: boolean
	showRemoveFromRoom?: boolean
	onClose: () => void
	onCloseReport?: () => void
	onAction?: (action: TalkRoomParticipantProfileAction) => void
}

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

const ACTION_CONFIG: Record<
	TalkRoomParticipantProfileRole,
	Array<{
		key: TalkRoomParticipantProfileAction
		label: string
		warning?: boolean
		icon: React.ReactNode
	}>
> = {
	'host-self': [
		{
			key: 'stop_hosting',
			label: 'Stop hosting',
			icon: <UserTagIcon width={24} height={24} fill="#48546B" />,
		},
	],
	speaker: [
		{
			key: 'remove_from_room',
			label: 'Remove from room',
			icon: <TrashIcon width={24} height={24} fill="#48546B" />,
		},
		{
			key: 'stepdown_to_listener',
			label: 'Make them become a listener',
			icon: <HeadPhoneIcon width={24} height={24} fill="#48546B" />,
		},
		{
			key: 'assign_as_host',
			label: 'Assign as host',
			icon: <UserTagIcon width={24} height={24} fill="#48546B" />,
		},
		{
			key: 'add_friend',
			label: 'Add friend',
			icon: <FriendNormalIcon width={24} height={24} fill="#48546B" />,
		},
		{
			key: 'report',
			label: 'Report',
			icon: <FlagIcon width={24} height={24} fill="#48546B" />,
		},
	],
	listener: [
		{
			key: 'invite_to_speaker',
			label: 'Invite to speaker',
			warning: true,
			icon: <IconShare size={24} stroke={1.5} color="#ce5b05" />,
		},
		{
			key: 'remove_from_room',
			label: 'Remove from room',
			icon: <TrashIcon width={24} height={24} fill="#48546B" />,
		},
		{
			key: 'assign_as_host',
			label: 'Assign As host',
			icon: <UserTagIcon width={24} height={24} fill="#48546B" />,
		},
		{
			key: 'add_friend',
			label: 'Add friend',
			icon: <FriendNormalIcon width={24} height={24} fill="#48546B" />,
		},
		{
			key: 'report',
			label: 'Report',
			icon: <FlagIcon width={24} height={24} fill="#48546B" />,
		},
	],
	'listener-self': [],
	'listener-other': [
		{
			key: 'add_friend',
			label: 'Add friend',
			icon: <FriendNormalIcon width={24} height={24} fill="#48546B" />,
		},
		{
			key: 'report',
			label: 'Report',
			icon: <FlagIcon width={24} height={24} fill="#48546B" />,
		},
	],
	'speaker-self': [
		{
			key: 'stepdown_to_listener',
			label: 'Stop speaking',
			icon: <UserTagIcon width={24} height={24} fill="#48546B" />,
		},
	],
	'speaker-other': [
		{
			key: 'add_friend',
			label: 'Add friend',
			icon: <FriendNormalIcon width={24} height={24} fill="#48546B" />,
		},
		{
			key: 'report',
			label: 'Report',
			icon: <FlagIcon width={24} height={24} fill="#48546B" />,
		},
	],
}

/** Builds language display items from user profile API data. */
const buildLanguageDisplayItems = (user?: UserProps | null) => {
	const { user_languages, languages_can_speak_array } = user || {}
	const nativeLanguages = (languages_can_speak_array || []).filter(Boolean)
	const practicingLanguages = user_languages || []

	if (!isArray(nativeLanguages, 1) && !isArray(practicingLanguages, 1)) {
		return []
	}

	const displayItems: Array<{
		key: string
		name: string
		level: string
		combined?: boolean
	}> = []

	if (nativeLanguages.length > 2) {
		displayItems.push({
			key: 'languages-can-speak-combined',
			name: nativeLanguages.join(', '),
			level: 'Native',
			combined: true,
		})
	} else {
		nativeLanguages.forEach((lang, index) => {
			displayItems.push({
				key: `native-${lang}-${index}`,
				name: lang,
				level: 'Native',
			})
		})
	}

	practicingLanguages.forEach((item, index) => {
		const { language_name, proficiency_level } = item || {}
		if (!language_name) return
		displayItems.push({
			key: `practice-${language_name}-${index}`,
			name: language_name,
			level:
				mappingLevelOptions[proficiency_level || ''] || proficiency_level || '',
		})
	})

	return displayItems
}

/** Profile modal shown when a participant is clicked on stage or in the listener list. */
function TalkRoomParticipantProfileModal({
	open,
	role,
	userProfile,
	talkRoomStats,
	loadingProfile = false,
	actionLoading = false,
	reportOpen = false,
	showStopHosting = false,
	showRemoveFromRoom = true,
	onClose,
	onCloseReport,
	onAction,
}: TalkRoomParticipantProfileModalProps) {
	const displayItems = useMemo(
		() => buildLanguageDisplayItems(userProfile),
		[userProfile],
	)

	if (!open) return null

	const {
		name,
		avatar,
		i_am_from,
		country_code,
		country,
		gender,
		birthday,
		is_hide_age,
		country_lived,
		country_lived_array,
		country_visited,
		country_visited_array,
		is_friend,
		id: userId,
	} = userProfile || {}

	const countryCode = i_am_from || country_code
	const countryLabel =
		country || mappingCountriesOptions[countryCode || '']?.name || ''
	const age = !is_hide_age && birthday ? getAge(birthday) : null
	const IconGender =
		genderIcon[(gender as keyof typeof genderIcon) || 'OTHER'] ??
		genderIcon.OTHER
	const genderColor =
		genderFill[(gender as keyof typeof genderFill) || 'OTHER'] ??
		genderFill.OTHER

	const livedText =
		country_lived || (country_lived_array || []).filter(Boolean).join(', ')
	const visitedList = country_visited_array?.length
		? country_visited_array
		: (country_visited || '')
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean)
	const visitedCount = visitedList.length
	const visitedText = visitedList.join(', ')

	const actions = ACTION_CONFIG[role].filter((item) => {
		if (item.key === 'add_friend' && is_friend) return false
		if (item.key === 'stop_hosting' && !showStopHosting) return false
		if (item.key === 'remove_from_room' && !showRemoveFromRoom) return false
		return true
	})

	const hideHostTimeCard =
		role === 'listener-self' ||
		role === 'listener-other' ||
		role === 'speaker-self' ||
		role === 'speaker-other'

	const statsData = {
		countriesConnected: talkRoomStats?.countriesConnected ?? 0,
		peopleTalked: talkRoomStats?.peopleTalked ?? 0,
		totalTalkedTimeInMinutes: talkRoomStats?.totalTalkedTimeInMinutes ?? 0,
		totalHostTimeInMinutes:
			talkRoomStats?.totalHostTimeInMinutes ?? DEFAULT_TOTAL_HOST_TIME_MINUTES,
	}

	return (
		<>
			<CModal
				open
				centered
				footer={null}
				closable={false}
				onCancel={actionLoading ? undefined : onClose}
				styles={{
					content: {
						width: 800,
						maxWidth: 'calc(100vw - 32px)',
						padding: 0,
						borderRadius: 8,
					},
					body: {
						padding: 0,
					},
				}}
			>
				<div className={classes.wrapper}>
					<div className={classes.header}>
						<h2 className={classes.title}>Profile</h2>
						<button
							type="button"
							className={classes.closeBtn}
							onClick={onClose}
							disabled={actionLoading}
							aria-label="Close"
						>
							<IconX size={16} />
						</button>
					</div>

					<div className={classes.body}>
						<div className={classes.profileSection}>
							<div className={classes.profileHeader}>
								<div className={classes.avatarWrap}>
									<CAvatar src={avatar} size={96} className={classes.avatar} />
									{countryCode ? (
										<div className={classes.flagWrapper}>
											<div
												className={clsx(
													`flag:${mappingFlag[countryCode] || countryCode}`,
													classes.flag,
												)}
											/>
										</div>
									) : null}
								</div>

								<div className={classes.profileDetails}>
									{name ? (
										<div className={classes.profileName}>{name}</div>
									) : null}

									{(countryLabel || age != null || gender) && (
										<div className={classes.metaRow}>
											{countryLabel ? (
												<span className={classes.metaText}>{countryLabel}</span>
											) : null}
											{countryLabel && age != null ? (
												<span className={classes.metaDot} />
											) : null}
											{age != null ? (
												<span className={classes.metaText}>{age} yrs</span>
											) : null}
											{age != null && gender ? (
												<span className={classes.metaDot} />
											) : null}
											{gender ? (
												<IconGender fill={genderColor} width={12} height={12} />
											) : null}
										</div>
									)}

									{livedText ? (
										<div className={classes.countryLine}>
											Countries &apos;ve lived in: {livedText}
										</div>
									) : null}
									{visitedText ? (
										<div className={classes.countryLine}>
											Countries&apos; ve visited ({visitedCount}): {visitedText}
										</div>
									) : null}

									{isArray(displayItems, 1) ? (
										<div className={classes.languageSkills}>
											{displayItems.map((item, index) => (
												<Fragment key={item.key}>
													{index > 0 && (
														<div className={classes.languageDivider} />
													)}
													<div className={classes.languageItem}>
														<span
															className={clsx(classes.languageName, {
																[classes.languageNameCombined]: item.combined,
															})}
														>
															{item.name}
														</span>
														<span className={classes.languageLevel}>
															{item.level}
														</span>
													</div>
												</Fragment>
											))}
										</div>
									) : null}
								</div>
							</div>
						</div>

						<div className={classes.statsSection}>
							<TalkRoomStats
								data={statsData}
								loading={loadingProfile}
								showHostTimeCard={!hideHostTimeCard}
							/>
						</div>

						{actions.length > 0 ? (
							<>
								<div className={classes.divider} />

								<div className={classes.actions}>
									{actions.map((action) => (
										<button
											key={action.key}
											type="button"
											className={classes.actionItem}
											disabled={actionLoading || loadingProfile}
											onClick={() => onAction?.(action.key)}
										>
											<span className={classes.actionIcon}>
												{action.icon}
											</span>
											<span
												className={clsx(classes.actionLabel, {
													[classes.actionLabelWarning]: action.warning,
												})}
											>
												{action.label}
											</span>
										</button>
									))}
								</div>
							</>
						) : null}
					</div>
				</div>
			</CModal>

			{reportOpen && userId ? (
				<ModalReport
					reportType={REPORT_ISSUE_TYPE.TALKROOM}
					title="Report"
					open
					data={{ user_id: userId }}
					onClose={onCloseReport}
				/>
			) : null}
		</>
	)
}

export default memo(TalkRoomParticipantProfileModal)
