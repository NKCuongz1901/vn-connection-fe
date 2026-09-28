'use client'

import { memo, useEffect, useState } from 'react'
import { IconFlame } from '@tabler/icons-react'
import clsx from 'clsx'

import { getStreakProfile, parseStreakProfile } from '@/apis/book/streakApis'
import { useLocalePath } from '@/ultis/route'
import { BOOK_STREAK_PATH } from '@/Variable/book.variable'

import classes from './StreakChip.module.scss'

/** 🔥 current streak on the Books overview; opens the Streak page */
function StreakChip() {
	const { onChangeRoute } = useLocalePath()
	const [current, setCurrent] = useState<number | null>(null)

	useEffect(() => {
		getStreakProfile()
			.then((res) => setCurrent(parseStreakProfile(res)?.current_streak || 0))
			.catch(() => setCurrent(0))
	}, [])

	return (
		<button
			type="button"
			className={clsx(classes.chip, { [classes.active]: Boolean(current) })}
			onClick={() => onChangeRoute(BOOK_STREAK_PATH)}
			aria-label={`Streak: ${current ?? 0} days`}
		>
			<IconFlame size={18} />
			<span>{current ?? '–'}</span>
			<span className={classes.label}>day streak</span>
		</button>
	)
}

export default memo(StreakChip)
