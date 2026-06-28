import { IconChevronRight } from '@tabler/icons-react'
import { Skeleton } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import ClockIcon from '@/svg/ClockIcon'
import MicroPhoneIcon from '@/svg/MicroPhoneIcon'
import WorldIcon from '@/svg/WorldIcon'

import classes from './TalkRoomStats.module.scss'

export type TalkRoomAnalysis = {
	countriesConnected?: number
	peopleTalked?: number
	totalTalkedTimeInMinutes?: number
	totalHostTimeInMinutes?: number
	todaySecondsUsed?: number
	todayRemainingSeconds?: number
	totalTalkedSeconds?: number
}

type TalkRoomStatsProps = {
	data?: TalkRoomAnalysis | null
	loading?: boolean
	onClickPeople?: () => void
	onClickCountries?: () => void
}

function TalkRoomStats({
	data,
	loading,
	onClickPeople,
	onClickCountries,
}: TalkRoomStatsProps) {
	if (loading) {
		return (
			<div className={classes.stats}>
				<Skeleton.Input active className={classes.skeletonConnected} />
				<Skeleton.Input active className={classes.skeletonTime} />
				<Skeleton.Input active className={classes.skeletonTime} />
			</div>
		)
	}

	const {
		countriesConnected = 0,
		peopleTalked = 0,
		totalTalkedTimeInMinutes = 0,
		totalHostTimeInMinutes = 0,
	} = data || {}

	return (
		<div className={classes.stats}>
			<div className={classes.connectedCard}>
				<div className={classes.connectedHeader}>
					<div className={classes.iconWrap}>
						<WorldIcon fill="#006B35" width={16} height={16} />
					</div>
					<span className={classes.connectedLabel}>Connected</span>
				</div>

				<div className={classes.connectedContent}>
					<button
						type="button"
						className={clsx(classes.statColumn, classes.statColumnClickable)}
						onClick={onClickCountries}
						disabled={!onClickCountries}
					>
						<span className={classes.statColumnLabel}>Countries</span>
						<div className={classes.statValueRow}>
							<span className={classes.statValue}>{countriesConnected}</span>
							<IconChevronRight size={16} color="#0F1729" stroke={1.5} />
						</div>
					</button>

					<button
						type="button"
						className={clsx(classes.statColumn, classes.statColumnClickable)}
						onClick={onClickPeople}
						disabled={!onClickPeople}
					>
						<span className={classes.statColumnLabel}>People</span>
						<div className={classes.statValueRow}>
							<span className={classes.statValue}>{peopleTalked}</span>
							<IconChevronRight size={16} color="#0F1729" stroke={1.5} />
						</div>
					</button>
				</div>
			</div>

			<div className={classes.timeCard}>
				<div className={classes.timeHeader}>
					<div className={classes.iconWrap}>
						<ClockIcon fill="#006B35" />
					</div>
					<span className={classes.timeLabel}>Total speaking time</span>
				</div>
				<div className={classes.timeValueRow}>
					<span className={classes.timeValue}>{totalTalkedTimeInMinutes}</span>
					<span className={classes.timeUnit}>Min</span>
				</div>
			</div>

			<div className={classes.timeCard}>
				<div className={classes.timeHeader}>
					<div className={classes.iconWrap}>
						<MicroPhoneIcon fill="#006B35" width={16} height={16} />
					</div>
					<span className={classes.timeLabel}>Total host time</span>
				</div>
				<div className={classes.timeValueRow}>
					<span className={classes.timeValue}>{totalHostTimeInMinutes}</span>
					<span className={classes.timeUnit}>Min</span>
				</div>
			</div>
		</div>
	)
}

export default memo(TalkRoomStats)
