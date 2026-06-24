import clsx from 'clsx'
import { Fragment, memo, useMemo } from 'react'

import CAvatar from '@/Components/Custom/CAvatar'
import { isArray } from '@/ultis/array'
import { mappingFlag } from '@/Variable/countryVariable'
import { mappingLevelOptions } from '@/Variable/common.variable'

import classes from './TalkRoomProfileInfo.module.scss'

type UserLanguage = {
	language_name?: string
	proficiency_level?: string
}

type LanguageDisplayItem = {
	key: string
	name: string
	level: string
	combined?: boolean
}

export type TalkRoomProfileUser = {
	name?: string
	avatar?: string
	i_am_from?: string
	country_code?: string
	languages_can_speak_array?: string[]
	user_languages?: UserLanguage[]
}

type TalkRoomProfileInfoProps = {
	user?: TalkRoomProfileUser
}

const buildLanguageDisplayItems = (
	user?: TalkRoomProfileUser,
): LanguageDisplayItem[] => {
	const { user_languages, languages_can_speak_array } = user || {}
	const nativeLanguages = (languages_can_speak_array || []).filter(Boolean)
	const practicingLanguages = user_languages || []

	if (!isArray(nativeLanguages, 1) && !isArray(practicingLanguages, 1)) {
		return []
	}

	const displayItems: LanguageDisplayItem[] = []

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
				mappingLevelOptions[proficiency_level || ''] ||
				proficiency_level ||
				'',
		})
	})

	return displayItems
}

function TalkRoomProfileInfo({ user }: TalkRoomProfileInfoProps) {
	const { name, avatar, i_am_from, country_code } = user || {}
	const countryCode = i_am_from || country_code
	const displayItems = useMemo(() => buildLanguageDisplayItems(user), [user])

	if (!name && !avatar) return null

	return (
		<div className={classes.profileInfo}>
			<div className={classes.avatarSection}>
				<div className={classes.avatarWrap}>
					<CAvatar src={avatar} size={96} className={classes.avatar} />
					{countryCode && (
						<div className={classes.flagWrapper}>
							<div
								className={clsx(
									`flag:${mappingFlag[countryCode] || countryCode}`,
									classes.flag,
								)}
							/>
						</div>
					)}
				</div>
			</div>

			<div className={classes.profileDetails}>
				{name && <div className={classes.profileName}>{name}</div>}

				{isArray(displayItems, 1) && (
					<div className={classes.languageSkills}>
						{displayItems.map((item, index) => (
							<Fragment key={item.key}>
								{index > 0 && <div className={classes.languageDivider} />}
								<div className={classes.languageItem}>
									<span
										className={clsx(classes.languageName, {
											[classes.languageNameCombined]: item.combined,
										})}
									>
										{item.name}
									</span>
									<span className={classes.languageLevel}>{item.level}</span>
								</div>
							</Fragment>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default memo(TalkRoomProfileInfo)
