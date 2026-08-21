'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { Popover } from 'antd'
import clsx from 'clsx'
import { useMemo, useState } from 'react'

import type { ReferralLeaderboardPeriod } from '@/apis/referralApis'
import ReferralLeaderboardPodium from '@/Components/Referral/ReferralLeaderboardPodium/ReferralLeaderboardPodium'

import classes from './ReferralLeaderboard.module.scss'
import ReferralLeaderboardList from '../ReferralLeaderBoardList/ReferralLeaderboardList'

export interface ReferralLeaderboardProps {
	loading?: boolean
	leaderBoard?: any[]
	topInvitees?: any[]
	myPosition?: number
	myTotalPoints?: number
	userData?: any
	period?: ReferralLeaderboardPeriod
	onChangePeriod?: (period: ReferralLeaderboardPeriod) => void
}

const PERIOD_OPTIONS = [
	{
		value: 'monthly' as const,
		label: 'By this month (default)',
		triggerLabel: 'By this month',
	},
	{
		value: 'yearly' as const,
		label: 'By this year',
		triggerLabel: 'By this year',
	},
	{
		value: 'all_time' as const,
		label: 'All time',
		triggerLabel: 'All time',
	},
]

function ReferralLeaderboard({
	loading,
	topInvitees = [],
	leaderBoard = [],
	myPosition = 0,
	myTotalPoints = 0,
	userData = {},
	period = 'monthly',
	onChangePeriod,
}: ReferralLeaderboardProps) {
	const [open, setOpen] = useState(false)

	const selectedOption = useMemo(
		() => PERIOD_OPTIONS.find((option) => option.value === period),
		[period],
	)

	const periodMenu = (
		<div className={classes.periodMenu}>
			{PERIOD_OPTIONS.map((option) => {
				const isActive = period === option.value
				return (
					<button
						key={option.value}
						type="button"
						className={classes.periodItem}
						onClick={() => {
							onChangePeriod?.(option.value)
							setOpen(false)
						}}
					>
						<span className={classes.periodControl}>
							<span
								className={clsx(classes.radioCircle, {
									[classes.radioCircleActive]: isActive,
								})}
							/>
						</span>
						<span className={classes.periodLabel}>{option.label}</span>
					</button>
				)
			})}
		</div>
	)

	return (
		<div className={classes.wrapper}>
			<Popover
				open={open}
				onOpenChange={setOpen}
				content={periodMenu}
				trigger="click"
				placement="bottomLeft"
				arrow={false}
				overlayClassName={classes.periodPopover}
			>
				<button type="button" className={classes.periodTrigger}>
					<span className={classes.periodTriggerLabel}>
						{selectedOption?.triggerLabel}
					</span>
					<IconChevronDown size={16} className={classes.periodTriggerIcon} />
				</button>
			</Popover>
			<ReferralLeaderboardPodium topInvitees={topInvitees} loading={loading} />
			<ReferralLeaderboardList
				loading={loading}
				leaderBoard={leaderBoard}
				myPosition={myPosition}
				myTotalPoints={myTotalPoints}
				userData={userData}
			/>
		</div>
	)
}

export default ReferralLeaderboard
